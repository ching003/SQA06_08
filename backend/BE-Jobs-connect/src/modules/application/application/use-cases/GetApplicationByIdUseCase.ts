import type { IApplicationRepository } from '../../domain/repositories/IApplicationRepository.js';
import type { IJobRepository } from '@modules/job/domain/repositories/IJobRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import type { GetApplicationByIdInputDTO, GetApplicationByIdOutputDTO } from '../dtos/ApplicationDTO.js';
import { mapApplicationToOutput } from '../helpers/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import { AuthorizationError, NotFoundError } from '@shared/domain/errors/index.js';

interface Dependencies {
  applicationRepository: IApplicationRepository;
  jobRepository: IJobRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class GetApplicationByIdUseCase {
  private readonly applicationRepository: IApplicationRepository;
  private readonly jobRepository: IJobRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ applicationRepository, jobRepository, companyMemberRepository }: Dependencies) {
    this.applicationRepository = applicationRepository;
    this.jobRepository = jobRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: GetApplicationByIdInputDTO): Promise<GetApplicationByIdOutputDTO> {
    const { applicationId, userId, userRole } = input;

    const application = await this.applicationRepository.findByIdWithRelations(applicationId);

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Check permission: user can view their own applications (CANDIDATE)
    if (application.userId === userId) {
      return mapApplicationToOutput(application);
    }

    // Check permission: admin can view all applications
    if (userRole === UserRole.ADMIN) {
      return mapApplicationToOutput(application);
    }

    // Check permission: RECRUITER can view applications for jobs in their company
    if (userRole === UserRole.RECRUITER) {
      const job = await this.jobRepository.findById(application.jobId);
      if (job) {
        // Verify user is a member of the company that owns this job
        const companyMember = await this.companyMemberRepository.findByCompanyAndUser(job.companyId, userId);
        if (companyMember) {
          return mapApplicationToOutput(application);
        }
      }
    }

    throw new AuthorizationError('You do not have permission to view this application');
  }
}
