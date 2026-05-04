import type { PrismaClient } from '@prisma/client';
import { InvitationStatus } from '../../modules/company/domain/enums/InvitationStatus.js';

interface Dependencies {
  prisma: PrismaClient;
}

export class ExpireInvitationsUseCase {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async execute(): Promise<{ expiredCount: number; invitationIds: string[] }> {
    const now = new Date();

    try {
      // Tìm tất cả invitations hết hạn với status = PENDING
      const expiredInvitations = await this.prisma.companyMemberInvitation.findMany({
        where: {
          status: InvitationStatus.PENDING,
          expiresAt: {
            lt: now,
          },
        },
        select: {
          id: true,
          companyId: true,
          userId: true,
        },
      });

      if (expiredInvitations.length === 0) {
        console.log(`[${now.toISOString()}] No expired invitations found`);
        return { expiredCount: 0, invitationIds: [] };
      }

      const invitationIds = expiredInvitations.map((inv) => inv.id);

      // Cập nhật status thành EXPIRED
      const result = await this.prisma.companyMemberInvitation.updateMany({
        where: {
          id: {
            in: invitationIds,
          },
        },
        data: {
          status: InvitationStatus.EXPIRED,
          updatedAt: now,
        },
      });

      console.log(
        `[${now.toISOString()}] Successfully expired ${result.count} invitations:`,
        invitationIds.join(', ')
      );

      // TODO: Tạo notifications cho users về invitations hết hạn
      // TODO: Optional - Xóa hoặc đánh dấu read các notifications liên quan

      return {
        expiredCount: result.count,
        invitationIds,
      };
    } catch (error) {
      console.error(`[${now.toISOString()}] Error expiring invitations:`, error);
      throw error;
    }
  }
}
