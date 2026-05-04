import type { Request, Response, NextFunction } from 'express';
import type { ITokenService } from '@shared/domain/services/ITokenService.js';
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import { AuthenticationError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserStatus, UserRole } from '@modules/user/domain/enums/index.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        status: UserStatus;
      };
      userId?: string;
    }
  }
}

interface AuthMiddlewareDependencies {
  tokenService: ITokenService;
  userRepository: IUserRepository;
}

export class AuthMiddleware {
  private readonly tokenService: ITokenService;
  private readonly userRepository: IUserRepository;

  constructor({ tokenService, userRepository }: AuthMiddlewareDependencies) {
    this.tokenService = tokenService;
    this.userRepository = userRepository;
  }

  private extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1];
  }

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractTokenFromHeader(req.headers.authorization);

      if (!token) {
        throw new AuthenticationError('Authentication required. Please provide a valid token.');
      }

      // Verify token
      const decoded = this.tokenService.verify(token);

      // Get user from database
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new AuthenticationError('User not found. Token is invalid.');
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        throw new AuthorizationError(
          `Account is ${user.status.toLowerCase()}. Please contact administrator.`
        );
      }

      // Check if token was issued before the last logout
      if (user.lastLogoutAt && decoded.iat) {
        // iat is in seconds, lastLogoutAt is in milliseconds
        if (decoded.iat * 1000 < user.lastLogoutAt.getTime()) {
          throw new AuthenticationError('Token has been invalidated. Please login again.');
        }
      }

      // Attach user to request
      req.user = {
        id: user.id!,
        email: user.email,
        role: user.role,
        status: user.status,
      };
      req.userId = user.id;
      next();
    } catch (error) {
      next(error);
    }
  };

  authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        next(new AuthenticationError('Authentication required'));
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        next(new AuthorizationError('Access denied. Insufficient permissions.'));
        return;
      }

      next();
    };
  };

  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractTokenFromHeader(req.headers.authorization);

      if (token) {
        const decoded = this.tokenService.verify(token);
        const user = await this.userRepository.findById(decoded.userId);
        if (user && user.status === UserStatus.ACTIVE) {
          req.user = {
            id: user.id!,
            email: user.email,
            role: user.role,
            status: user.status,
          };
          req.userId = user.id;
        }
      }
      next();
    } catch {
      // Ignore errors for optional auth
      next();
    }
  };
}
