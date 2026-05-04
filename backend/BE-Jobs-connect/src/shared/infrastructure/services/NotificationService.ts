import type { PrismaClient, NotificationType } from '@prisma/client';
import type { INotificationService, CreateNotificationInput, NotificationOutput } from '../../domain/services/INotificationService.js';

interface Dependencies {
  prisma: PrismaClient;
}

export class NotificationService implements INotificationService {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async createNotification(input: CreateNotificationInput): Promise<NotificationOutput> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type as NotificationType,
        title: input.title,
        message: input.message,
        isRead: false,
      },
    });

    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: input.data || null,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await this.prisma.notification.delete({
        where: { id: notificationId },
      });
    } catch (error) {
      // Ignore if notification doesn't exist
      console.error('Error deleting notification:', error);
    }
  }

  async notifyNewApplication(applicationId: string): Promise<void> {
    try {
      // Get application with job and company details
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          user: true,
          job: {
            include: {
              company: {
                include: {
                  members: {
                    where: {
                      companyRole: { in: ['OWNER', 'MANAGER', 'RECRUITER'] },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!application || !application.job) {
        return;
      }

      // Notify company members (owners, managers, recruiters)
      const members = application.job.company?.members || [];
      for (const member of members) {
        await this.prisma.notification.create({
          data: {
            userId: member.userId,
            type: 'APPLICATION_RECEIVED',
            title: 'Đơn ứng tuyển mới',
            message: `${application.user?.fullName || 'Một ứng viên'} đã ứng tuyển cho vị trí "${application.job.title}"`,
            isRead: false,
          },
        });
      }
    } catch (error) {
      console.error('Error notifying new application:', error);
    }
  }

  async notifyApplicationStatusChange(applicationId: string): Promise<void> {
    try {
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: {
            include: {
              company: true,
            },
          },
        },
      });

      if (!application) {
        return;
      }

      // Determine notification message based on status
      let title: string;
      let message: string;

      switch (application.status) {
        case 'REVIEWING':
          title = 'Đơn ứng tuyển đang được xem xét';
          message = `Đơn ứng tuyển của bạn cho vị trí "${application.job.title}" tại ${application.job.company?.name || 'công ty'} đang được xem xét`;
          break;
        case 'ACCEPTED':
          title = 'Đơn ứng tuyển được chấp nhận';
          message = `Chúc mừng! Đơn ứng tuyển của bạn cho vị trí "${application.job.title}" tại ${application.job.company?.name || 'công ty'} đã được chấp nhận`;
          break;
        case 'REJECTED':
          title = 'Cập nhật đơn ứng tuyển';
          message = `Đơn ứng tuyển của bạn cho vị trí "${application.job.title}" tại ${application.job.company?.name || 'công ty'} đã được xem xét`;
          break;
        default:
          return;
      }

      await this.prisma.notification.create({
        data: {
          userId: application.userId,
          type: 'APPLICATION_STATUS_CHANGED',
          title,
          message,
          isRead: false,
        },
      });
    } catch (error) {
      console.error('Error notifying application status change:', error);
    }
  }
}
