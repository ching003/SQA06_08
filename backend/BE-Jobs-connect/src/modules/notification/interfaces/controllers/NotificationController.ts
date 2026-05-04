import type { Request, Response, NextFunction } from 'express';
import type { GetMyNotificationsUseCase } from '../../application/use-cases/GetMyNotificationsUseCase.js';
import type { GetNotificationByIdUseCase } from '../../application/use-cases/GetNotificationByIdUseCase.js';
import type { GetUnreadCountUseCase } from '../../application/use-cases/GetUnreadCountUseCase.js';
import type { MarkAsReadUseCase } from '../../application/use-cases/MarkAsReadUseCase.js';
import type { MarkAllAsReadUseCase } from '../../application/use-cases/MarkAllAsReadUseCase.js';
import type { DeleteNotificationUseCase } from '../../application/use-cases/DeleteNotificationUseCase.js';
import type { DeleteAllReadNotificationsUseCase } from '../../application/use-cases/DeleteAllReadNotificationsUseCase.js';
import { HttpStatus } from '@shared/constants/httpStatus.js';
import { notificationPaginationSchema } from '../validators/notificationValidators.js';
import { ZodError } from 'zod';

interface Dependencies {
  getMyNotificationsUseCase: GetMyNotificationsUseCase;
  getNotificationByIdUseCase: GetNotificationByIdUseCase;
  getUnreadCountUseCase: GetUnreadCountUseCase;
  markAsReadUseCase: MarkAsReadUseCase;
  markAllAsReadUseCase: MarkAllAsReadUseCase;
  deleteNotificationUseCase: DeleteNotificationUseCase;
  deleteAllReadNotificationsUseCase: DeleteAllReadNotificationsUseCase;
}

export class NotificationController {
  private readonly getMyNotificationsUseCase: GetMyNotificationsUseCase;
  private readonly getNotificationByIdUseCase: GetNotificationByIdUseCase;
  private readonly getUnreadCountUseCase: GetUnreadCountUseCase;
  private readonly markAsReadUseCase: MarkAsReadUseCase;
  private readonly markAllAsReadUseCase: MarkAllAsReadUseCase;
  private readonly deleteNotificationUseCase: DeleteNotificationUseCase;
  private readonly deleteAllReadNotificationsUseCase: DeleteAllReadNotificationsUseCase;

  constructor(deps: Dependencies) {
    this.getMyNotificationsUseCase = deps.getMyNotificationsUseCase;
    this.getNotificationByIdUseCase = deps.getNotificationByIdUseCase;
    this.getUnreadCountUseCase = deps.getUnreadCountUseCase;
    this.markAsReadUseCase = deps.markAsReadUseCase;
    this.markAllAsReadUseCase = deps.markAllAsReadUseCase;
    this.deleteNotificationUseCase = deps.deleteNotificationUseCase;
    this.deleteAllReadNotificationsUseCase = deps.deleteAllReadNotificationsUseCase;
  }

  getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = notificationPaginationSchema.parse(req.query);
      const result = await this.getMyNotificationsUseCase.execute({
        userId: req.user!.id,
        ...query,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Lấy danh sách thông báo thành công',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Xác thực thất bại',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };

  getNotificationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getNotificationByIdUseCase.execute({
        notificationId: req.params.id,
        userId: req.user!.id,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Lấy thông tin thông báo thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getUnreadCountUseCase.execute({
        userId: req.user!.id,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Lấy số lượng thông báo chưa đọc thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.markAsReadUseCase.execute({
        notificationId: req.params.id,
        userId: req.user!.id,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Đánh dấu thông báo đã đọc thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.markAllAsReadUseCase.execute({
        userId: req.user!.id,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Đánh dấu tất cả thông báo đã đọc thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.deleteNotificationUseCase.execute({
        notificationId: req.params.id,
        userId: req.user!.id,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Xóa thông báo thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAllReadNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.deleteAllReadNotificationsUseCase.execute({
        userId: req.user!.id,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          deletedCount: result.deletedCount,
        },
        message: `Đã xóa ${result.deletedCount} thông báo đã đọc thành công`,
      });
    } catch (error) {
      next(error);
    }
  };
}
