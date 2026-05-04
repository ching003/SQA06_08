import type { ISavedJobRepository } from '../../domain/repositories/ISavedJobRepository.js';
import type { GetSavedJobsInputDTO, GetSavedJobsOutputDTO, SaveJobOutputDTO } from '../dtos/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { AuthorizationError } from '@shared/domain/errors/index.js';

interface Dependencies {
  savedJobRepository: ISavedJobRepository;
}

export class GetSavedJobsUseCase {
  private readonly savedJobRepository: ISavedJobRepository;

  constructor({ savedJobRepository }: Dependencies) {
    this.savedJobRepository = savedJobRepository;
  }

  async execute(input: GetSavedJobsInputDTO): Promise<GetSavedJobsOutputDTO> {
    // Check if user is CANDIDATE
    if (input.userRole !== UserRole.CANDIDATE) {
      throw new AuthorizationError('Only candidates can view saved jobs');
    }

    const result = await this.savedJobRepository.findByUserId(input.userId, {
      page: input.page || 1,
      limit: input.limit || 10,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: result.data.map((savedJob) => this.mapToOutput(savedJob)),
      pagination: result.pagination,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToOutput(savedJob: any): SaveJobOutputDTO {
    return {
      id: savedJob.id,
      jobId: savedJob.jobId,
      userId: savedJob.userId,
      createdAt: savedJob.createdAt,
      job: savedJob.job
        ? {
            id: savedJob.job.id,
            companyId: savedJob.job.companyId,
            title: savedJob.job.title,
            description: savedJob.job.description,
            location: savedJob.job.location,
            industry: savedJob.job.industry,
            jobType: savedJob.job.jobType || savedJob.job.type,
            experienceLevel: savedJob.job.experienceLevel,
            urgent: savedJob.job.urgent || false,
            status: savedJob.job.status,
            expiresAt: savedJob.job.expiresAt,
            applicationCount: savedJob.job.applicationCount || 0,
            createdAt: savedJob.job.createdAt,
            updatedAt: savedJob.job.updatedAt,
            company: savedJob.job.company
              ? {
                  id: savedJob.job.company.id,
                  name: savedJob.job.company.name,
                  logoUrl: savedJob.job.company.logoUrl,
                  industry: savedJob.job.company.industry,
                  companySize: savedJob.job.company.companySize,
                  status: savedJob.job.company.status,
                }
              : undefined,
            salary: savedJob.job.salary
              ? {
                  id: savedJob.job.salary.id,
                  minAmount: savedJob.job.salary.minAmount,
                  maxAmount: savedJob.job.salary.maxAmount,
                  currency: savedJob.job.salary.currency || 'VND',
                  isNegotiable: savedJob.job.salary.isNegotiable ?? false,
                  hideAmount: savedJob.job.salary.hideAmount ?? false,
                }
              : undefined,
            benefits: savedJob.job.benefits
              ? savedJob.job.benefits.map((b: { id: string; title: string; description?: string | null }) => ({
                  id: b.id,
                  title: b.title,
                  description: b.description,
                }))
              : [],
            requirements: savedJob.job.requirements
              ? savedJob.job.requirements.map((r: { id: string; title: string; description?: string | null }) => ({
                  id: r.id,
                  title: r.title,
                  description: r.description,
                }))
              : [],
          }
        : undefined,
    };
  }
}
