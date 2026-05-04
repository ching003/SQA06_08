import type { PrismaClient } from '@prisma/client';
import type {
  ISavedJobRepository,
  FindSavedJobsOptions,
  PaginatedResult,
} from '../../domain/repositories/ISavedJobRepository.js';
import type { SavedJob } from '../../domain/entities/SavedJob.js';
import { SavedJobMapper } from '../mappers/SavedJobMapper.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPrismaClient = any;

interface Dependencies {
  prisma: PrismaClient;
}

export class PrismaSavedJobRepository implements ISavedJobRepository {
  private readonly prisma: AnyPrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<SavedJob | null> {
    const savedJob = await this.prisma.savedJob.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: true,
            salary: true,
          },
        },
      },
    });

    if (!savedJob) return null;

    return SavedJobMapper.toDomainWithRelations(savedJob);
  }

  async findByUserId(
    userId: string,
    options: FindSavedJobsOptions = {}
  ): Promise<PaginatedResult<SavedJob>> {
    const { page = 1, limit = 10, orderBy = { createdAt: 'desc' } } = options;

    const where = { userId };

    const [savedJobs, total] = await Promise.all([
      this.prisma.savedJob.findMany({
        where,
        include: {
          job: {
            include: {
              company: true,
              salary: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.savedJob.count({ where }),
    ]);

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: savedJobs.map((s: any) => SavedJobMapper.toDomainWithRelations(s)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUserAndJob(userId: string, jobId: string): Promise<SavedJob | null> {
    const savedJob = await this.prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
      include: {
        job: {
          include: {
            company: true,
            salary: true,
          },
        },
      },
    });

    if (!savedJob) return null;

    return SavedJobMapper.toDomainWithRelations(savedJob);
  }

  async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    const savedJob = await this.prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    return !!savedJob;
  }

  async save(savedJob: SavedJob): Promise<SavedJob> {
    const data = SavedJobMapper.toPersistence(savedJob);

    const created = await this.prisma.savedJob.create({
      data,
      include: {
        job: {
          include: {
            company: true,
            salary: true,
          },
        },
      },
    });

    return SavedJobMapper.toDomainWithRelations(created);
  }

  async delete(id: string): Promise<SavedJob> {
    const deleted = await this.prisma.savedJob.delete({
      where: { id },
    });

    return SavedJobMapper.toDomain(deleted);
  }

  async deleteByUserAndJob(userId: string, jobId: string): Promise<SavedJob> {
    const deleted = await this.prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    return SavedJobMapper.toDomain(deleted);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.savedJob.count({
      where: { userId },
    });
  }
}
