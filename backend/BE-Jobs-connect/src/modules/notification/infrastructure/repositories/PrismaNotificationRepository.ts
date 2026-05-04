import type { PrismaClient, NotificationType as PrismaNotificationType } from '@prisma/client';
import type {
  INotificationRepository,
  FindNotificationsOptions,
  PaginatedResult,
} from '../../domain/repositories/INotificationRepository.js';
import type { Notification } from '../../domain/entities/Notification.js';
import { NotificationMapper } from '../mappers/NotificationMapper.js';

interface Dependencies {
  prisma: PrismaClient;
}

export class PrismaNotificationRepository implements INotificationRepository {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string, include?: Record<string, unknown>): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: include as Record<string, boolean>,
    });

    if (!notification) {
      return null;
    }

    return NotificationMapper.toDomain(notification);
  }

  async findByIdWithRelations(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!notification) {
      return null;
    }

    return NotificationMapper.toDomainWithRelations(notification);
  }

  async findByUserId(userId: string, options?: FindNotificationsOptions): Promise<PaginatedResult<Notification>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId };
    if (options?.isRead !== undefined) {
      where.isRead = options.isRead;
    }
    if (options?.type) {
      where.type = options.type as PrismaNotificationType;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: options?.orderBy || { createdAt: 'desc' },
        include: {
          invitation: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                },
              },
              inviter: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications.map(NotificationMapper.toDomainWithInvitation),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async save(notification: Notification): Promise<Notification> {
    const data = NotificationMapper.toPersistence(notification);
    const created = await this.prisma.notification.create({
      data: data as {
        userId: string;
        type: PrismaNotificationType;
        title: string;
        message: string;
        isRead: boolean;
      },
    });
    return NotificationMapper.toDomain(created);
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    const updated = await this.prisma.notification.update({
      where: { id },
      data: {
        isRead: data.isRead,
      },
    });
    return NotificationMapper.toDomain(updated);
  }

  async markAsRead(id: string): Promise<Notification> {
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return NotificationMapper.toDomain(updated);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Notification> {
    const deleted = await this.prisma.notification.delete({
      where: { id },
    });
    return NotificationMapper.toDomain(deleted);
  }

  async deleteAllRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });
    return result.count;
  }
}
