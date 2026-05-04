import type { IApplicationRepository } from '../../domain/repositories/IApplicationRepository.js';
import type { IJobRepository } from '@modules/job/domain/repositories/IJobRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import { AuthorizationError } from '@shared/domain/errors/index.js';
import type { GetApplicationsByJobInputDTO, GetApplicationsByJobOutputDTO } from '../dtos/ApplicationDTO.js';
import { mapApplicationToOutput } from '../helpers/index.js';

interface Dependencies {
  applicationRepository: IApplicationRepository;
  jobRepository: IJobRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class GetApplicationsByJobUseCase {
  private readonly applicationRepository: IApplicationRepository;
  private readonly jobRepository: IJobRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ applicationRepository, jobRepository, companyMemberRepository }: Dependencies) {
    this.applicationRepository = applicationRepository;
    this.jobRepository = jobRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: GetApplicationsByJobInputDTO): Promise<GetApplicationsByJobOutputDTO> {
    const { jobId, userId, userRole, page = 1, limit = 10, status } = input;

    // Check if job exists
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Check permission: only company members and admins can view applications for a job
    const isAdmin = userRole === UserRole.ADMIN;
    if (!isAdmin) {
      // Check if user is a member of the company that owns this job
      const companyMember = await this.companyMemberRepository.findByCompanyAndUser(job.companyId, userId);
      if (!companyMember) {
        throw new AuthorizationError('You do not have permission to view applications for this job');
      }
    }

    const result = await this.applicationRepository.findByJobId(jobId, {
      page,
      limit,
      status,
      includeRelations: true,
    });

    return {
      data: result.data.map(mapApplicationToOutput),
      pagination: result.pagination,
    };
  }
}
