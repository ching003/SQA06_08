import type { PrismaClient } from '@prisma/client';
import type {
  IApplicationRepository,
  FindApplicationsOptions,
  PaginatedResult,
} from '../../domain/repositories/IApplicationRepository.js';
import type { Application } from '../../domain/entities/Application.js';
import { ApplicationMapper } from '../mappers/ApplicationMapper.js';
import { ApplicationStatus } from '../../domain/enums/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPrismaClient = any;

interface Dependencies {
  prisma: PrismaClient;
}

export class PrismaApplicationRepository implements IApplicationRepository {
  private readonly prisma: AnyPrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string, include?: Record<string, unknown>): Promise<Application | null> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: include || undefined,
    });

    if (!application) return null;

    return ApplicationMapper.toDomain(application);
  }

  async findByIdWithRelations(id: string): Promise<Application | null> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        user: true,
        job: {
          include: {
            company: true,
          },
        },
        cv: true,
      },
    });

    if (!application) return null;

    return ApplicationMapper.toDomainWithRelations(application);
  }

  async findByUserId(
    userId: string,
    options: FindApplicationsOptions = {}
  ): Promise<PaginatedResult<Application>> {
    const { page = 1, limit = 10, status, orderBy = { createdAt: 'desc' } } = options;

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          user: true,
          job: {
            include: {
              company: true,
            },
          },
          cv: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: applications.map((app: any) => ApplicationMapper.toDomainWithRelations(app)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByJobId(
    jobId: string,
    options: FindApplicationsOptions = {}
  ): Promise<PaginatedResult<Application>> {
    const { page = 1, limit = 10, status, orderBy = { createdAt: 'desc' } } = options;

    const where: Record<string, unknown> = { jobId };
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          user: true,
          job: {
            include: {
              company: true,
            },
          },
          cv: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: applications.map((app: any) => ApplicationMapper.toDomainWithRelations(app)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findActiveByUserAndJob(userId: string, jobId: string): Promise<Application | null> {
    const application = await this.prisma.application.findFirst({
      where: {
        userId,
        jobId,
        status: {
          not: ApplicationStatus.CANCELLED,
        },
      },
      include: {
        user: true,
        job: {
          include: {
            company: true,
          },
        },
        cv: true,
      },
    });

    if (!application) return null;

    return ApplicationMapper.toDomainWithRelations(application);
  }

  async save(application: Application): Promise<Application> {
    const data = ApplicationMapper.toPersistence(application);

    const created = await this.prisma.application.create({
      data,
      include: {
        user: true,
        job: {
          include: {
            company: true,
          },
        },
        cv: true,
      },
    });

    return ApplicationMapper.toDomainWithRelations(created);
  }

  async update(id: string, data: Partial<Application>): Promise<Application> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.coverLetter !== undefined) updateData.coverLetter = data.coverLetter;

    const updated = await this.prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        job: {
          include: {
            company: true,
          },
        },
        cv: true,
      },
    });

    return ApplicationMapper.toDomainWithRelations(updated);
  }

  async delete(id: string): Promise<Application> {
    const deleted = await this.prisma.application.delete({
      where: { id },
    });

    return ApplicationMapper.toDomain(deleted);
  }

  async countByJobId(jobId: string): Promise<number> {
    return this.prisma.application.count({
      where: { jobId },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.application.count({
      where: { userId },
    });
  }
}
