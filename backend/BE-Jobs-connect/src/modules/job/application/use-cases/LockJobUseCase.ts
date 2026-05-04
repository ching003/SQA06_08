import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { LockJobInputDTO, LockJobOutputDTO } from '../dtos/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { NotFoundError, AuthorizationError, BusinessRuleError } from '@shared/domain/errors/index.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
}

export class LockJobUseCase {
  private readonly jobRepository: IJobRepository;

  constructor({ jobRepository }: Dependencies) {
    this.jobRepository = jobRepository;
  }

  async execute(input: LockJobInputDTO): Promise<LockJobOutputDTO> {
    // Only admin can lock jobs
    if (input.userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('Only admin can lock jobs');
    }

    // Find job
    const job = await this.jobRepository.findByIdWithRelations(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Check if job is already locked
    if (job.status === JobStatus.LOCKED) {
      throw new BusinessRuleError('Job is already locked');
    }

    // Lock job
    const updatedJob = await this.jobRepository.update(input.jobId, {
      status: JobStatus.LOCKED,
    });

    return mapJobToOutput(updatedJob);
  }
}

