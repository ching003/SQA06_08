import type { Request, Response, NextFunction } from 'express';
import type { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase.js';
import type { LoginUserUseCase } from '../../application/use-cases/LoginUserUseCase.js';
import type { GetUserByIdUseCase } from '../../application/use-cases/GetUserByIdUseCase.js';
import type { GetAllUsersUseCase } from '../../application/use-cases/GetAllUsersUseCase.js';
import type { GetUserInfoUseCase } from '../../application/use-cases/GetUserInfoUseCase.js';
import type { GetUserAgeUseCase } from '../../application/use-cases/GetUserAgeUseCase.js';
import type { UpdateProfileUseCase } from '../../application/use-cases/UpdateProfileUseCase.js';
import type { ChangePasswordUseCase } from '../../application/use-cases/ChangePasswordUseCase.js';
import type { UploadAvatarUseCase } from '../../application/use-cases/UploadAvatarUseCase.js';
import type { UpdateUserStatusUseCase } from '../../application/use-cases/UpdateUserStatusUseCase.js';
import type { LockUserUseCase } from '../../application/use-cases/LockUserUseCase.js';
import type { UnlockUserUseCase } from '../../application/use-cases/UnlockUserUseCase.js';
import type { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase.js';
import type { UpdateUserUseCase } from '../../application/use-cases/UpdateUserUseCase.js';
import type { DeleteUserUseCase } from '../../application/use-cases/DeleteUserUseCase.js';
import type { LogoutUserUseCase } from '../../application/use-cases/LogoutUserUseCase.js';
import type { GetRecentActivitiesUseCase } from '../../application/use-cases/GetRecentActivitiesUseCase.js';
import {
  registerSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateStatusSchema,
  userIdParamSchema,
  getUsersQuerySchema,
} from '../validators/userValidators.js';
import { ValidationError, AuthorizationError } from '@shared/domain/errors/index.js';
import { HttpStatus } from '@shared/constants/index.js';
import { UserRole } from '../../domain/enums/UserRole.js';

interface UserControllerDependencies {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  getUserByIdUseCase: GetUserByIdUseCase;
  getAllUsersUseCase: GetAllUsersUseCase;
  getUserInfoUseCase: GetUserInfoUseCase;
  getUserAgeUseCase: GetUserAgeUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
  changePasswordUseCase: ChangePasswordUseCase;
  uploadAvatarUseCase: UploadAvatarUseCase;
  updateUserStatusUseCase: UpdateUserStatusUseCase;
  lockUserUseCase: LockUserUseCase;
  unlockUserUseCase: UnlockUserUseCase;
  createUserUseCase: CreateUserUseCase;

  updateUserUseCase: UpdateUserUseCase;
  deleteUserUseCase: DeleteUserUseCase;
  logoutUserUseCase: LogoutUserUseCase;
  getRecentActivitiesUseCase: GetRecentActivitiesUseCase;
}

export class UserController {
  private readonly registerUserUseCase: RegisterUserUseCase;
  private readonly loginUserUseCase: LoginUserUseCase;
  private readonly getUserByIdUseCase: GetUserByIdUseCase;
  private readonly getAllUsersUseCase: GetAllUsersUseCase;
  private readonly getUserInfoUseCase: GetUserInfoUseCase;
  private readonly getUserAgeUseCase: GetUserAgeUseCase;
  private readonly updateProfileUseCase: UpdateProfileUseCase;
  private readonly changePasswordUseCase: ChangePasswordUseCase;
  private readonly uploadAvatarUseCase: UploadAvatarUseCase;
  private readonly updateUserStatusUseCase: UpdateUserStatusUseCase;
  private readonly lockUserUseCase: LockUserUseCase;
  private readonly unlockUserUseCase: UnlockUserUseCase;
  private readonly createUserUseCase: CreateUserUseCase;
  private readonly updateUserUseCase: UpdateUserUseCase;

  private readonly deleteUserUseCase: DeleteUserUseCase;
  private readonly logoutUserUseCase: LogoutUserUseCase;
  private readonly getRecentActivitiesUseCase: GetRecentActivitiesUseCase;

  constructor(deps: UserControllerDependencies) {
    this.registerUserUseCase = deps.registerUserUseCase;
    this.loginUserUseCase = deps.loginUserUseCase;
    this.getUserByIdUseCase = deps.getUserByIdUseCase;
    this.getAllUsersUseCase = deps.getAllUsersUseCase;
    this.getUserInfoUseCase = deps.getUserInfoUseCase;
    this.getUserAgeUseCase = deps.getUserAgeUseCase;
    this.updateProfileUseCase = deps.updateProfileUseCase;
    this.changePasswordUseCase = deps.changePasswordUseCase;
    this.uploadAvatarUseCase = deps.uploadAvatarUseCase;
    this.updateUserStatusUseCase = deps.updateUserStatusUseCase;
    this.lockUserUseCase = deps.lockUserUseCase;
    this.unlockUserUseCase = deps.unlockUserUseCase;
    this.createUserUseCase = deps.createUserUseCase;
    this.updateUserUseCase = deps.updateUserUseCase;
    this.deleteUserUseCase = deps.deleteUserUseCase;
    this.logoutUserUseCase = deps.logoutUserUseCase;
    this.getRecentActivitiesUseCase = deps.getRecentActivitiesUseCase;
  }

  /**
   * POST /api/users/register
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Xác thực thất bại', validation.error.issues.map((e) => e.message));
      }

      const result = await this.registerUserUseCase.execute(validation.data);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: result,
        message: 'Đăng ký tài khoản thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/users/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Xác thực thất bại', validation.error.issues.map((e) => e.message));
      }

      const result = await this.loginUserUseCase.execute(validation.data);

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Đăng nhập thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/users/logout
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.userId) {
        await this.logoutUserUseCase.execute(req.userId);
      }

      // JWT is stateless, logout is handled client-side but we also invalidate it server-side
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Đăng xuất thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/:id
   */
  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          paramValidation.error.issues.map((e) => e.message)
        );
      }

      const { id } = paramValidation.data;
      const viewerUserId = req.userId;
      const viewerRole = req.user?.role;

      // Check permission
      const isOwnProfile = viewerUserId === id;
      const isAdmin = viewerRole === UserRole.ADMIN;
      const isRecruiter = viewerRole === UserRole.RECRUITER;

      if (!isOwnProfile && !isAdmin && !isRecruiter) {
        throw new AuthorizationError('Bạn không có quyền xem hồ sơ người dùng này');
      }

      const result = await this.getUserByIdUseCase.execute({
        id,
        viewerUserId,
        viewerRole,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Lấy thông tin người dùng thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/:id/info
   */
  getUserInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          paramValidation.error.issues.map((e) => e.message)
        );
      }

      const result = await this.getUserInfoUseCase.execute(paramValidation.data.id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/:id/age
   */
  getAge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          paramValidation.error.issues.map((e) => e.message)
        );
      }

      const result = await this.getUserAgeUseCase.execute(paramValidation.data.id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users
   */
  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryValidation = getUsersQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          queryValidation.error.issues.map((e) => e.message)
        );
      }

      const { page, limit, role, status, search, orderBy } = queryValidation.data;

      // Parse orderBy to extract field and direction (e.g., "createdAt:desc")
      const orderByParts = orderBy?.split(':') || ['createdAt', 'desc'];
      const orderField = orderByParts[0];
      const orderDirection = (orderByParts[1] as 'asc' | 'desc') || 'desc';

      const result = await this.getAllUsersUseCase.execute({
        page: typeof page === 'string' ? parseInt(page) : page,
        limit: typeof limit === 'string' ? parseInt(limit) : limit,
        role,
        status,
        search,
        orderBy: orderField,
        orderDirection,
        viewerUserId: req.userId,
        viewerRole: req.user?.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id/profile
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          paramValidation.error.issues.map((e) => e.message)
        );
      }

      const { id } = paramValidation.data;
      const currentUserId = req.userId!;
      const currentUserRole = req.user!.role;

      // Check permission
      if (currentUserRole !== UserRole.ADMIN && currentUserId !== id) {
        throw new AuthorizationError('Bạn chỉ có thể cập nhật hồ sơ của chính mình');
      }

      const bodyValidation = updateProfileSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          bodyValidation.error.issues.map((e) => e.message)
        );
      }

      const result = await this.updateProfileUseCase.execute({
        id,
        ...bodyValidation.data,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Cập nhật hồ sơ thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id/password
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          paramValidation.error.issues.map((e) => e.message)
        );
      }

      const { id } = paramValidation.data;
      const currentUserId = req.userId!;

      // User can only change their own password
      if (currentUserId !== id) {
        throw new AuthorizationError('Bạn chỉ có thể thay đổi mật khẩu của chính mình');
      }

      const bodyValidation = changePasswordSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          bodyValidation.error.issues.map((e) => e.message)
        );
      }

      const result = await this.changePasswordUseCase.execute({
        id,
        ...bodyValidation.data,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/users/:id/avatar
   */
  uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          paramValidation.error.issues.map((e) => e.message)
        );
      }

      const { id } = paramValidation.data;
      const currentUserId = req.userId!;
      const currentUserRole = req.user!.role;

      // Check permission
      if (currentUserRole !== UserRole.ADMIN && currentUserId !== id) {
        throw new AuthorizationError('Bạn chỉ có thể tải lên ảnh đại diện của chính mình');
      }

      if (!req.file) {
        throw new ValidationError('Không có file được tải lên');
      }

      const result = await this.uploadAvatarUseCase.execute({
        id,
        file: {
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
        },
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Tải lên ảnh đại diện thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id/status
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          paramValidation.error.issues.map((e) => e.message)
        );
      }

      const { id } = paramValidation.data;
      const currentUserId = req.userId!;
      const currentUserRole = req.user!.role;

      // Check permission
      if (currentUserRole !== UserRole.ADMIN && currentUserId !== id) {
        throw new AuthorizationError('Bạn chỉ có thể cập nhật trạng thái của chính mình');
      }

      const bodyValidation = updateStatusSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          bodyValidation.error.issues.map((e) => e.message)
        );
      }

      const result = await this.updateUserStatusUseCase.execute({
        id,
        status: bodyValidation.data.status,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: `Cập nhật trạng thái người dùng thành ${result.status} thành công`,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id/lock
   */
  lockAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          paramValidation.error.issues.map((e) => e.message)
        );
      }

      const result = await this.lockUserUseCase.execute({
        userId: paramValidation.data.id,
        adminId: req.userId!,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Khóa tài khoản thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id/unlock
   */
  unlockAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          paramValidation.error.issues.map((e) => e.message)
        );
      }

      const result = await this.unlockUserUseCase.execute({
        userId: paramValidation.data.id,
        adminId: req.userId!,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Mở khóa tài khoản thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/users
   */
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = createUserSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Xác thực thất bại', validation.error.issues.map((e) => e.message));
      }

      const result = await this.createUserUseCase.execute(validation.data);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: result,
        message: 'Tạo người dùng thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id
   */
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          paramValidation.error.issues.map((e) => e.message)
        );
      }

      const bodyValidation = updateUserSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          bodyValidation.error.issues.map((e) => e.message)
        );
      }

      const result = await this.updateUserUseCase.execute({
        id: paramValidation.data.id,
        ...bodyValidation.data,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Cập nhật người dùng thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/users/:id
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          'Xác thực thất bại',
          paramValidation.error.issues.map((e) => e.message)
        );
      }

      const result = await this.deleteUserUseCase.execute({
        id: paramValidation.data.id,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /admin/activities/recent
   */
  getRecentActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const adminId = req.userId!;

      const result = await this.getRecentActivitiesUseCase.execute({
        adminId,
        limit,
      });

      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
