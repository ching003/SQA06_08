import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import type { ITokenService, TokenPayload } from '../../domain/services/ITokenService.js';
import { AuthenticationError } from '../../domain/errors/index.js';

export class JwtTokenService implements ITokenService {
  private readonly secret: Secret;
  private readonly expiresIn: string;
  private readonly expiresInSeconds: number;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'default-secret-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.expiresInSeconds = this.parseExpiresIn(this.expiresIn);
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60; // Default 7 days in seconds
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60;
    }
  }

  generate(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.expiresInSeconds,
    };
    return jwt.sign(payload, this.secret, options);
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid token');
      }
      throw new AuthenticationError('Token verification failed');
    }
  }

  decode(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload | null;
      return decoded;
    } catch {
      return null;
    }
  }

  getExpiresIn(): number {
    return this.expiresInSeconds;
  }
}
