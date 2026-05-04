import type { PrismaClient } from '@prisma/client';
import type {
  IJobRepository,
  FindAllJobsOptions,
  SearchJobsOptions,
  PaginatedResult,
  CreateJobData,
  UpdateJobData,
} from '../../domain/repositories/IJobRepository.js';
import type { Job } from '../../domain/entities/Job.js';
import type { SimilarJob } from '../../domain/entities/SimilarJob.js';
import { JobMapper } from '../mappers/JobMapper.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPrismaClient = any;

interface Dependencies {
  prisma: PrismaClient;
}

// Default include for job queries with all relations
const JOB_INCLUDE_ALL = {
  company: true,
  salary: true,
  skills: true,
  benefits: true,
  requirements: true,
};

export class PrismaJobRepository implements IJobRepository {
  private readonly prisma: AnyPrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string, include?: Record<string, unknown>): Promise<Job | null> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: include || JOB_INCLUDE_ALL,
    });

    if (!job) return null;

    return JobMapper.toDomainWithRelations(job);
  }

  async findByIdWithRelations(id: string): Promise<Job | null> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: JOB_INCLUDE_ALL,
    });

    if (!job) return null;

    return JobMapper.toDomainWithRelations(job);
  }

  async findByCompanyId(
    companyId: string,
    options: FindAllJobsOptions = {}
  ): Promise<PaginatedResult<Job>> {
    const { page = 1, limit = 10, status, orderBy = { createdAt: 'desc' } } = options;

    const where: Record<string, unknown> = { companyId };
    if (status) where.status = status;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: JOB_INCLUDE_ALL,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: jobs.map((job: any) => JobMapper.toDomainWithRelations(job)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(options: FindAllJobsOptions = {}): Promise<PaginatedResult<Job>> {
    const {
      page = 1,
      limit = 10,
      status,
      companyId,
      jobType,
      experienceLevel,
      search,
      location,
      salaryMin,
      salaryMax,
      orderBy = { createdAt: 'desc' },
      hasSalary = false,
    } = options;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (jobType) where.type = jobType;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Filter for jobs with valid salary (when sorting by salary)
    if (hasSalary) {
      where.salary = {
        is: {
          maxAmount: { not: null },
          minAmount: { not: null },
          isNegotiable: false,
          hideAmount: false,
        },
      };
    } else if (salaryMin || salaryMax) {
      // Regular salary range filter (when not sorting by salary)
      where.salary = {
        is: {
          AND: [
            salaryMin ? { maxAmount: { gte: salaryMin } } : {},
            salaryMax ? { minAmount: { lte: salaryMax } } : {},
          ].filter(condition => Object.keys(condition).length > 0),
        },
      };
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: JOB_INCLUDE_ALL,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: jobs.map((job: any) => JobMapper.toDomainWithRelations(job)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findActiveJobs(options: FindAllJobsOptions = {}): Promise<PaginatedResult<Job>> {
    return this.findAll({
      ...options,
      status: JobStatus.ACTIVE,
    });
  }

  async searchJobs(options: SearchJobsOptions = {}): Promise<PaginatedResult<Job>> {
    const {
      keyword,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      status,
      page = 1,
      limit = 10,
    } = options;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: status || JobStatus.ACTIVE,
    };

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (jobType) {
      where.type = jobType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (salaryMin || salaryMax) {
      where.salary = {
        is: {
          AND: [
            // Nếu có salaryMin, job.salary.maxAmount phải >= salaryMin (overlap)
            salaryMin ? { maxAmount: { gte: salaryMin } } : {},
            // Nếu có salaryMax, job.salary.minAmount phải <= salaryMax (overlap)
            salaryMax ? { minAmount: { lte: salaryMax } } : {},
          ].filter(condition => Object.keys(condition).length > 0),
        },
      };
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: JOB_INCLUDE_ALL,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: jobs.map((job: any) => JobMapper.toDomainWithRelations(job)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async save(job: Job): Promise<Job> {
    const data = JobMapper.toPersistence(job);

    const created = await this.prisma.job.create({
      data,
      include: JOB_INCLUDE_ALL,
    });

    return JobMapper.toDomainWithRelations(created);
  }

  async create(data: CreateJobData): Promise<Job> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createData: any = {
      companyId: data.companyId,
      title: data.title,
      description: data.description,
      location: data.location,
      industry: data.industry,
      type: data.jobType,
      experienceLevel: data.experienceLevel,
      urgent: data.urgent ?? false,
      status: data.status ?? JobStatus.ACTIVE,
      expiresAt: data.expiresAt,
      applicationCount: 0,
    };

    // Create salary if provided
    if (data.salary) {
      createData.salary = {
        create: {
          minAmount: data.salary.minAmount,
          maxAmount: data.salary.maxAmount,
          currency: data.salary.currency ?? 'VND',
          isNegotiable: data.salary.isNegotiable ?? false,
          hideAmount: data.salary.hideAmount ?? false,
        },
      };
    }

    // Create skills if provided
    if (data.skills && data.skills.length > 0) {
      createData.skills = {
        create: data.skills.map((s) => ({
          skillName: s.skillName,
          level: s.level,
          yearsOfExperience: s.yearsOfExperience,
        })),
      };
    }

    // Create benefits if provided
    if (data.benefits && data.benefits.length > 0) {
      createData.benefits = {
        create: data.benefits.map((b) => ({
          title: b.title,
          description: b.description,
        })),
      };
    }

    // Create requirements if provided
    if (data.requirements && data.requirements.length > 0) {
      createData.requirements = {
        create: data.requirements.map((r) => ({
          title: r.title,
          description: r.description,
        })),
      };
    }

    const created = await this.prisma.job.create({
      data: createData,
      include: JOB_INCLUDE_ALL,
    });

    return JobMapper.toDomainWithRelations(created);
  }

  async update(id: string, data: Partial<Job> | UpdateJobData): Promise<Job> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if ('title' in data && data.title !== undefined) updateData.title = data.title;
    if ('description' in data && data.description !== undefined) updateData.description = data.description;
    if ('location' in data && data.location !== undefined) updateData.location = data.location;
    if ('industry' in data && data.industry !== undefined) updateData.industry = data.industry;
    if ('jobType' in data && data.jobType !== undefined) updateData.type = data.jobType;
    if ('experienceLevel' in data && data.experienceLevel !== undefined) updateData.experienceLevel = data.experienceLevel;
    if ('urgent' in data && data.urgent !== undefined) updateData.urgent = data.urgent;
    if ('status' in data && data.status !== undefined) updateData.status = data.status;
    if ('expiresAt' in data && data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
    if ('applicationCount' in data && data.applicationCount !== undefined) updateData.applicationCount = data.applicationCount;

    const updated = await this.prisma.job.update({
      where: { id },
      data: updateData,
      include: JOB_INCLUDE_ALL,
    });

    return JobMapper.toDomainWithRelations(updated);
  }

  async updateWithRelations(id: string, data: UpdateJobData): Promise<Job> {
    // Start with basic update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.jobType !== undefined) updateData.type = data.jobType;
    if (data.experienceLevel !== undefined) updateData.experienceLevel = data.experienceLevel;
    if (data.urgent !== undefined) updateData.urgent = data.urgent;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;

    // Handle salary update
    if (data.salary !== undefined) {
      if (data.salary === null) {
        // Delete salary if explicitly set to null
        await this.prisma.salary.deleteMany({ where: { jobId: id } });
      } else {
        // Upsert salary
        updateData.salary = {
          upsert: {
            create: {
              minAmount: data.salary.minAmount,
              maxAmount: data.salary.maxAmount,
              currency: data.salary.currency ?? 'VND',
              isNegotiable: data.salary.isNegotiable ?? false,
              hideAmount: data.salary.hideAmount ?? false,
            },
            update: {
              minAmount: data.salary.minAmount,
              maxAmount: data.salary.maxAmount,
              currency: data.salary.currency,
              isNegotiable: data.salary.isNegotiable,
              hideAmount: data.salary.hideAmount,
            },
          },
        };
      }
    }

    // Handle skills update (delete all and recreate)
    if (data.skills !== undefined) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId: id } });
      if (data.skills && data.skills.length > 0) {
        updateData.skills = {
          create: data.skills.map((s) => ({
            skillName: s.skillName,
            level: s.level,
            yearsOfExperience: s.yearsOfExperience,
          })),
        };
      }
    }

    // Handle benefits update (delete all and recreate)
    if (data.benefits !== undefined) {
      await this.prisma.jobBenefit.deleteMany({ where: { jobId: id } });
      if (data.benefits && data.benefits.length > 0) {
        updateData.benefits = {
          create: data.benefits.map((b) => ({
            title: b.title,
            description: b.description,
          })),
        };
      }
    }

    // Handle requirements update (delete all and recreate)
    if (data.requirements !== undefined) {
      await this.prisma.jobRequirement.deleteMany({ where: { jobId: id } });
      if (data.requirements && data.requirements.length > 0) {
        updateData.requirements = {
          create: data.requirements.map((r) => ({
            title: r.title,
            description: r.description,
          })),
        };
      }
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: updateData,
      include: JOB_INCLUDE_ALL,
    });

    return JobMapper.toDomainWithRelations(updated);
  }

  async delete(id: string): Promise<Job> {
    const deleted = await this.prisma.job.delete({
      where: { id },
      include: JOB_INCLUDE_ALL,
    });

    return JobMapper.toDomainWithRelations(deleted);
  }

  async incrementApplicationCount(id: string): Promise<Job> {
    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        applicationCount: {
          increment: 1,
        },
      },
      include: JOB_INCLUDE_ALL,
    });

    return JobMapper.toDomainWithRelations(updated);
  }

  async findSimilarJobs(jobId: string, limit: number = 5): Promise<Job[]> {
    // Get the original job first
    const originalJob = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: {
        industry: true,
        type: true,
        experienceLevel: true,
        location: true,
      },
    });

    if (!originalJob) return [];

    // Find similar jobs based on same industry, job type, or experience level
    const similarJobs = await this.prisma.job.findMany({
      where: {
        id: { not: jobId },
        status: JobStatus.ACTIVE,
        OR: [
          { industry: originalJob.industry },
          { type: originalJob.type },
          { experienceLevel: originalJob.experienceLevel },
        ],
      },
      include: JOB_INCLUDE_ALL,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return similarJobs.map((job: any) => JobMapper.toDomainWithRelations(job));
  }

  async findSimilarJobsFromTable(
    jobId: string,
    limit: number = 10,
    minSimilarity: number = 0
  ): Promise<SimilarJob[]> {
    const similarJobs = await this.prisma.similarJob.findMany({
      where: {
        jobId,
        similarity: { gte: minSimilarity },
      },
      include: {
        similarJob: {
          include: JOB_INCLUDE_ALL,
        },
      },
      orderBy: { similarity: 'desc' },
      take: limit,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return similarJobs.map((sj: any) => JobMapper.mapSimilarJob(sj));
  }

  async updateJobsByCompanyId(companyId: string, data: Partial<Job>): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;

    const result = await this.prisma.job.updateMany({
      where: { companyId },
      data: updateData,
    });

    return result.count;
  }
}
