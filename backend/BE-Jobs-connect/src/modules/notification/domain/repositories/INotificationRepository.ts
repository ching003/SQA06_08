import type { Notification } from '../entities/Notification.js';

export interface FindNotificationsOptions {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface INotificationRepository {
  findById(id: string, include?: Record<string, unknown>): Promise<Notification | null>;
  findByIdWithRelations(id: string): Promise<Notification | null>;
  findByUserId(userId: string, options?: FindNotificationsOptions): Promise<PaginatedResult<Notification>>;
  countUnreadByUserId(userId: string): Promise<number>;
  save(notification: Notification): Promise<Notification>;
  update(id: string, data: Partial<Notification>): Promise<Notification>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string): Promise<Notification>;
  deleteAllRead(userId: string): Promise<number>;
}
