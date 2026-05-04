import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { UnlockJobInputDTO, UnlockJobOutputDTO } from '../dtos/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { NotFoundError, AuthorizationError, BusinessRuleError } from '@shared/domain/errors/index.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
}

export class UnlockJobUseCase {
  private readonly jobRepository: IJobRepository;

  constructor({ jobRepository }: Dependencies) {
    this.jobRepository = jobRepository;
  }

  async execute(input: UnlockJobInputDTO): Promise<UnlockJobOutputDTO> {
    // Only admin can unlock jobs
    if (input.userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('Only admin can unlock jobs');
    }

    // Find job
    const job = await this.jobRepository.findByIdWithRelations(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Check if job is locked
    if (job.status !== JobStatus.LOCKED) {
      throw new BusinessRuleError('Job is not locked');
    }

    // Unlock job - restore to previous status (ACTIVE if it was active before, or PENDING)
    // For simplicity, we'll restore to ACTIVE status
    const updatedJob = await this.jobRepository.update(input.jobId, {
      status: JobStatus.ACTIVE,
    });

    return mapJobToOutput(updatedJob);
  }
}

