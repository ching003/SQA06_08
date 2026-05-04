import { Notification } from '../../domain/entities/Notification.js';
import type { NotificationType } from '../../domain/enums/NotificationType.js';

export class NotificationMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomain(raw: any): Notification {
    return new Notification({
      id: raw.id,
      userId: raw.userId,
      type: raw.type as NotificationType,
      title: raw.title,
      message: raw.message,
      data: raw.data ?? null,
      isRead: raw.isRead,
      readAt: raw.readAt ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomainWithRelations(raw: any): Notification {
    return new Notification({
      id: raw.id,
      userId: raw.userId,
      type: raw.type as NotificationType,
      title: raw.title,
      message: raw.message,
      data: raw.data ?? null,
      isRead: raw.isRead,
      readAt: raw.readAt ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      user: raw.user
        ? {
            id: raw.user.id,
            email: raw.user.email,
            fullName: raw.user.fullName,
            avatarUrl: raw.user.avatarUrl,
          }
        : undefined,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomainWithInvitation(raw: any): Notification {
    return new Notification({
      id: raw.id,
      userId: raw.userId,
      type: raw.type as NotificationType,
      title: raw.title,
      message: raw.message,
      data: raw.data ?? null,
      isRead: raw.isRead,
      readAt: raw.readAt ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      invitation: raw.invitation
        ? {
            id: raw.invitation.id,
            companyId: raw.invitation.companyId,
            userId: raw.invitation.userId,
            inviterId: raw.invitation.inviterId,
            role: raw.invitation.role,
            status: raw.invitation.status,
            expiresAt: raw.invitation.expiresAt ?? null,
            createdAt: raw.invitation.createdAt,
            company: raw.invitation.company
              ? {
                  id: raw.invitation.company.id,
                  name: raw.invitation.company.name,
                  logoUrl: raw.invitation.company.logoUrl ?? null,
                }
              : undefined,
            inviter: raw.invitation.inviter
              ? {
                  id: raw.invitation.inviter.id,
                  fullName: raw.invitation.inviter.fullName ?? null,
                  email: raw.invitation.inviter.email,
                }
              : undefined,
          }
        : null,
    });
  }

  static toPersistence(notification: Notification): Record<string, unknown> {
    return {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.isRead,
      readAt: notification.readAt,
    };
  }
}
