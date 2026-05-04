import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import type { RepostJobInputDTO, RepostJobOutputDTO } from '../dtos/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { CompanyRole } from '@modules/company/domain/enums/CompanyRole.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class RepostJobUseCase {
  private readonly jobRepository: IJobRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ jobRepository, companyMemberRepository }: Dependencies) {
    this.jobRepository = jobRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: RepostJobInputDTO): Promise<RepostJobOutputDTO> {
    // Find original job
    const originalJob = await this.jobRepository.findByIdWithRelations(input.jobId);
    if (!originalJob) {
      throw new NotFoundError('Job not found');
    }

    // Check authorization - admin can repost any job
    if (input.userRole !== UserRole.ADMIN) {
      const member = await this.companyMemberRepository.findByCompanyAndUser(
        originalJob.companyId,
        input.userId
      );

      if (!member) {
        throw new AuthorizationError('You are not a member of this company');
      }

      const allowedRoles: string[] = [CompanyRole.OWNER, CompanyRole.MANAGER, CompanyRole.RECRUITER];
      if (!allowedRoles.includes(member.companyRole)) {
        throw new AuthorizationError('You do not have permission to repost jobs');
      }
    }

    // Calculate default expiration (30 days from now)
    const defaultExpiration = new Date();
    defaultExpiration.setDate(defaultExpiration.getDate() + 30);

    // Create a NEW job based on the original with overrides from input
    const newJob = await this.jobRepository.create({
      companyId: originalJob.companyId,
      title: input.title ?? originalJob.title,
      description: input.description ?? originalJob.description,
      location: input.location ?? originalJob.location ?? '',
      industry: input.industry ?? originalJob.industry ?? '',
      jobType: input.jobType ?? originalJob.jobType ?? 'FULL_TIME',
      experienceLevel: input.experienceLevel ?? originalJob.experienceLevel ?? 'JUNIOR',
      urgent: input.urgent ?? originalJob.urgent ?? false,
      status: JobStatus.ACTIVE,
      expiresAt: input.expiresAt ?? defaultExpiration,
      salary:
        input.salary !== undefined
          ? input.salary
          : originalJob.salary
            ? {
                minAmount: originalJob.salary.minAmount,
                maxAmount: originalJob.salary.maxAmount,
                currency: originalJob.salary.currency ?? 'VND',
                isNegotiable: originalJob.salary.isNegotiable ?? false,
                hideAmount: originalJob.salary.hideAmount ?? false,
              }
            : undefined,
      benefits:
        input.benefits !== undefined
          ? input.benefits
          : originalJob.benefits?.map((b) => ({
              title: b.title,
              description: b.description,
            })),
      requirements:
        input.requirements !== undefined
          ? input.requirements
          : originalJob.requirements?.map((r) => ({
              title: r.title,
              description: r.description,
            })),
    });

    return mapJobToOutput(newJob);
  }
}
