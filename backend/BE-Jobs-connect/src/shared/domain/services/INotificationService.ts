export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface NotificationOutput {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationService {
  createNotification(input: CreateNotificationInput): Promise<NotificationOutput>;
  markAsRead(notificationId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  notifyNewApplication(applicationId: string): Promise<void>;
  notifyApplicationStatusChange(applicationId: string): Promise<void>;
}
