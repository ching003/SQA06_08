import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import type { GetJobByIdInputDTO, GetJobByIdOutputDTO } from '../dtos/index.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
  userRepository: IUserRepository;
}

export class GetJobByIdUseCase {
  private readonly jobRepository: IJobRepository;
  private readonly userRepository: IUserRepository;

  constructor({ jobRepository, userRepository }: Dependencies) {
    this.jobRepository = jobRepository;
    this.userRepository = userRepository;
  }

  async execute(input: GetJobByIdInputDTO): Promise<GetJobByIdOutputDTO> {
    const job = await this.jobRepository.findByIdWithRelations(input.jobId);

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Locked jobs can only be viewed by ADMIN or RECRUITER from the same company
    if (job.status === JobStatus.LOCKED) {
      if (input.userRole === UserRole.ADMIN) {
        // Admin can view all locked jobs
      } else if (input.userRole === UserRole.RECRUITER && input.userId) {
        // Check if recruiter belongs to the company
        const user = await this.userRepository.findByIdWithCompanyMember(input.userId);
        if (!user || !user.companyMember || user.companyMember.company?.id !== job.companyId) {
          throw new AuthorizationError('Tin tuyển dụng đã bị khóa và không thể xem');
        }
      } else {
        // Candidates and other users cannot view locked jobs
        throw new AuthorizationError('Tin tuyển dụng đã bị khóa và không thể xem');
      }
    }

    return mapJobToOutput(job);
  }
}
