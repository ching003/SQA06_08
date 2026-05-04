import type { PrismaClient } from '@prisma/client';
import { JobStatus } from '../../modules/job/domain/enums/JobStatus.js';

interface Dependencies {
  prisma: PrismaClient;
}

export class ExpireJobsUseCase {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async execute(): Promise<{ expiredCount: number; jobIds: string[] }> {
    const now = new Date();

    try {
      // Tìm tất cả jobs hết hạn với status = ACTIVE
      const expiredJobs = await this.prisma.job.findMany({
        where: {
          status: JobStatus.ACTIVE,
          expiresAt: {
            not: null,
            lt: now,
          },
        },
        select: {
          id: true,
          title: true,
          companyId: true,
        },
      });

      if (expiredJobs.length === 0) {
        console.log(`[${now.toISOString()}] No expired jobs found`);
        return { expiredCount: 0, jobIds: [] };
      }

      const jobIds = expiredJobs.map((job) => job.id);

      // Cập nhật status thành EXPIRED
      const result = await this.prisma.job.updateMany({
        where: {
          id: {
            in: jobIds,
          },
        },
        data: {
          status: JobStatus.EXPIRED,
          updatedAt: now,
        },
      });

      console.log(
        `[${now.toISOString()}] Successfully expired ${result.count} jobs:`,
        expiredJobs.map((j) => `${j.title} (${j.id})`).join(', ')
      );

      // TODO: Tạo notifications cho companies về jobs hết hạn
      // TODO: Optional - Tự động reject các applications PENDING của jobs này

      return {
        expiredCount: result.count,
        jobIds,
      };
    } catch (error) {
      console.error(`[${now.toISOString()}] Error expiring jobs:`, error);
      throw error;
    }
  }
}
