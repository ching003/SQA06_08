import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import type { CloseJobInputDTO, CloseJobOutputDTO } from '../dtos/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { CompanyRole } from '@modules/company/domain/enums/CompanyRole.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { NotFoundError, AuthorizationError, BusinessRuleError } from '@shared/domain/errors/index.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class CloseJobUseCase {
  private readonly jobRepository: IJobRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ jobRepository, companyMemberRepository }: Dependencies) {
    this.jobRepository = jobRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: CloseJobInputDTO): Promise<CloseJobOutputDTO> {
    // Find job
    const job = await this.jobRepository.findByIdWithRelations(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Check if job can be closed
    if (job.status === JobStatus.INACTIVE) {
      throw new BusinessRuleError('Job is already closed');
    }

    // Check authorization - admin can close any job
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
        throw new AuthorizationError('You do not have permission to close jobs');
      }
    }

    // Close job
    const updatedJob = await this.jobRepository.update(input.jobId, {
      status: JobStatus.INACTIVE,
    });

    return mapJobToOutput(updatedJob);
  }
}
