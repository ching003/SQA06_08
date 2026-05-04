import type { IJobRepository, UpdateJobData } from '../../domain/repositories/IJobRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import type { UpdateJobInputDTO, UpdateJobOutputDTO } from '../dtos/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { CompanyRole } from '@modules/company/domain/enums/CompanyRole.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class UpdateJobUseCase {
  private readonly jobRepository: IJobRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ jobRepository, companyMemberRepository }: Dependencies) {
    this.jobRepository = jobRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: UpdateJobInputDTO): Promise<UpdateJobOutputDTO> {
    // Find job
    const job = await this.jobRepository.findByIdWithRelations(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Check authorization - admin can update any job
    if (input.userRole !== UserRole.ADMIN) {
      const member = await this.companyMemberRepository.findByCompanyAndUser(
        job.companyId,
        input.userId
      );

      if (!member) {
        throw new AuthorizationError('You are not a member of this company');
      }

      const allowedRoles: string[] = [CompanyRole.OWNER, CompanyRole.MANAGER, CompanyRole.RECRUITER];
      if (!allowedRoles.includes(member.companyRole)) {
        throw new AuthorizationError('You do not have permission to update jobs');
      }
    }

    // Build update data
    const updateData: UpdateJobData = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.location !== undefined) updateData.location = input.location ?? undefined;
    if (input.industry !== undefined) updateData.industry = input.industry ?? undefined;
    if (input.jobType !== undefined) updateData.jobType = input.jobType;
    if (input.experienceLevel !== undefined) updateData.experienceLevel = input.experienceLevel;
    if (input.urgent !== undefined) updateData.urgent = input.urgent;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt ?? undefined;

    // Handle salary update
    if (input.salary !== undefined) {
      updateData.salary = input.salary
        ? {
            minAmount: input.salary.minAmount,
            maxAmount: input.salary.maxAmount,
            currency: input.salary.currency,
            isNegotiable: input.salary.isNegotiable,
            hideAmount: input.salary.hideAmount,
          }
        : null;
    }

    // Handle benefits update
    if (input.benefits !== undefined) {
      updateData.benefits = input.benefits?.map((b) => ({
        title: b.title,
        description: b.description,
      }));
    }

    // Handle requirements update
    if (input.requirements !== undefined) {
      updateData.requirements = input.requirements?.map((r) => ({
        title: r.title,
        description: r.description,
      }));
    }

    // Use updateWithRelations if we have nested data to update
    const hasNestedData =
      input.salary !== undefined || input.benefits !== undefined || input.requirements !== undefined;

    const updatedJob = hasNestedData
      ? await this.jobRepository.updateWithRelations(input.jobId, updateData)
      : await this.jobRepository.update(input.jobId, updateData);

    return mapJobToOutput(updatedJob);
  }
}
