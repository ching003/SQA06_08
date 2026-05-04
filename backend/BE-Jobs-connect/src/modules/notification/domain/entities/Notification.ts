import type { NotificationType } from '../enums/NotificationType.js';

// Partial relation type for Notification
export interface NotificationUser {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

// Partial relation type for Invitation linked to Notification
export interface NotificationInvitation {
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

export interface NotificationProps {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  user?: NotificationUser;
  invitation?: NotificationInvitation | null;
}

export class Notification {
  readonly id?: string;
  readonly userId: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly data?: Record<string, unknown> | null;
  readonly isRead: boolean;
  readonly readAt?: Date | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly user?: NotificationUser;
  readonly invitation?: NotificationInvitation | null;

  constructor(props: NotificationProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.title = props.title;
    this.message = props.message;
    this.data = props.data;
    this.isRead = props.isRead;
    this.readAt = props.readAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.user = props.user;
    this.invitation = props.invitation;
  }

  with(props: Partial<NotificationProps>): Notification {
    return new Notification({
      id: this.id,
      userId: props.userId ?? this.userId,
      type: props.type ?? this.type,
      title: props.title ?? this.title,
      message: props.message ?? this.message,
      data: props.data !== undefined ? props.data : this.data,
      isRead: props.isRead ?? this.isRead,
      readAt: props.readAt !== undefined ? props.readAt : this.readAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      user: props.user !== undefined ? props.user : this.user,
      invitation: props.invitation !== undefined ? props.invitation : this.invitation,
    });
  }
}
