import type { IApplicationRepository } from '../../domain/repositories/IApplicationRepository.js';
import type { IJobRepository } from '@modules/job/domain/repositories/IJobRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import type { UpdateApplicationStatusInputDTO, UpdateApplicationStatusOutputDTO } from '../dtos/ApplicationDTO.js';
import { mapApplicationToOutput } from '../helpers/index.js';
import { ApplicationStatus } from '../../domain/enums/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import { AuthorizationError, NotFoundError } from '@shared/domain/errors/index.js';

interface Dependencies {
  applicationRepository: IApplicationRepository;
  jobRepository: IJobRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class UpdateApplicationStatusUseCase {
  private readonly applicationRepository: IApplicationRepository;
  private readonly jobRepository: IJobRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ applicationRepository, jobRepository, companyMemberRepository }: Dependencies) {
    this.applicationRepository = applicationRepository;
    this.jobRepository = jobRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: UpdateApplicationStatusInputDTO): Promise<UpdateApplicationStatusOutputDTO> {
    const { applicationId, userId, userRole, status, notes } = input;

    const application = await this.applicationRepository.findByIdWithRelations(applicationId);

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Check permission: only company members (RECRUITER) and admins can update application status
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isAdmin) {
      // RECRUITER must be a member of the company that owns this job
      if (userRole !== UserRole.RECRUITER) {
        throw new AuthorizationError('Only recruiters and admins can update application status');
      }

      const job = await this.jobRepository.findById(application.jobId);
      if (!job) {
        throw new NotFoundError('Job not found');
      }

      const companyMember = await this.companyMemberRepository.findByCompanyAndUser(job.companyId, userId);
      if (!companyMember) {
        throw new AuthorizationError('You must be a member of the company that owns this job');
      }
    }

    // Validate status transition
    if (!this.isValidStatusTransition(application.status, status)) {
      throw new Error(`Invalid status transition from ${application.status} to ${status}`);
    }

    const updatedApplication = await this.applicationRepository.update(applicationId, {
      status,
      notes,
    });

    const applicationWithRelations = await this.applicationRepository.findByIdWithRelations(updatedApplication.id!);

    return mapApplicationToOutput(applicationWithRelations);
  }

  private isValidStatusTransition(currentStatus: ApplicationStatus, newStatus: ApplicationStatus): boolean {
    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.PENDING]: [
        ApplicationStatus.REVIEWING,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.CANCELLED,
      ],
      [ApplicationStatus.REVIEWING]: [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.CANCELLED,
      ],
      [ApplicationStatus.ACCEPTED]: [],
      [ApplicationStatus.REJECTED]: [],
      [ApplicationStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
}
