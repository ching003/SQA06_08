import type { NotificationOutputDTO, NotificationInvitationOutputDTO } from '../dtos/NotificationDTO.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvitationToOutput(invitation: any): NotificationInvitationOutputDTO | null {
  if (!invitation) return null;

  return {
    id: invitation.id,
    companyId: invitation.companyId,
    userId: invitation.userId,
    inviterId: invitation.inviterId,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt ?? null,
    createdAt: invitation.createdAt,
    company: invitation.company
      ? {
          id: invitation.company.id,
          name: invitation.company.name,
          logoUrl: invitation.company.logoUrl ?? null,
        }
      : undefined,
    inviter: invitation.inviter
      ? {
          id: invitation.inviter.id,
          fullName: invitation.inviter.fullName ?? null,
          email: invitation.inviter.email,
        }
      : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapNotificationToOutput(notification: any): NotificationOutputDTO {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    isRead: notification.isRead,
    readAt: notification.readAt ?? null,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
    invitation: mapInvitationToOutput(notification.invitation),
  };
}
