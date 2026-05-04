import type { NotificationType } from '../../domain/enums/NotificationType.js';

// ============ Pagination DTO ============

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============ Invitation Output DTO (for notification) ============

export interface NotificationInvitationOutputDTO {
  id: string;
  companyId: string;
  userId: string;
  inviterId: string;
  role: string;
  status: string;
  expiresAt?: Date | null;
  createdAt: Date;
  company?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  inviter?: {
    id: string;
    fullName?: string | null;
    email: string;
  };
}

// ============ Notification Output DTO ============

export interface NotificationOutputDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  invitation?: NotificationInvitationOutputDTO | null;
}

// ============ Get My Notifications DTOs ============

export interface GetMyNotificationsInputDTO {
  userId: string;
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

export interface GetMyNotificationsOutputDTO {
  data: NotificationOutputDTO[];
  pagination: PaginationDTO;
}

// ============ Get Notification By ID DTOs ============

export interface GetNotificationByIdInputDTO {
  notificationId: string;
  userId: string;
}

export interface GetNotificationByIdOutputDTO extends NotificationOutputDTO {}

// ============ Get Unread Count DTOs ============

export interface GetUnreadCountInputDTO {
  userId: string;
}

export interface GetUnreadCountOutputDTO {
  unreadCount: number;
}

// ============ Mark As Read DTOs ============

export interface MarkAsReadInputDTO {
  notificationId: string;
  userId: string;
}

export interface MarkAsReadOutputDTO extends NotificationOutputDTO {}

// ============ Mark All As Read DTOs ============

export interface MarkAllAsReadInputDTO {
  userId: string;
}

export interface MarkAllAsReadOutputDTO {
  success: boolean;
}

// ============ Delete Notification DTOs ============

export interface DeleteNotificationInputDTO {
  notificationId: string;
  userId: string;
}

export interface DeleteNotificationOutputDTO extends NotificationOutputDTO {}

// ============ Delete All Read DTOs ============

export interface DeleteAllReadInputDTO {
  userId: string;
}

export interface DeleteAllReadOutputDTO {
  deletedCount: number;
}
