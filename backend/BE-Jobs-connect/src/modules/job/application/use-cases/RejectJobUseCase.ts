import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { RejectJobInputDTO, RejectJobOutputDTO } from '../dtos/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { NotFoundError, AuthorizationError, BusinessRuleError } from '@shared/domain/errors/index.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
}

export class RejectJobUseCase {
  private readonly jobRepository: IJobRepository;

  constructor({ jobRepository }: Dependencies) {
    this.jobRepository = jobRepository;
  }

  async execute(input: RejectJobInputDTO): Promise<RejectJobOutputDTO> {
    // Only admin can reject jobs
    if (input.userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('Only admin can reject jobs');
    }

    // Find job
    const job = await this.jobRepository.findByIdWithRelations(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Check if job can be rejected
    if (job.status !== JobStatus.PENDING) {
      throw new BusinessRuleError('Only pending jobs can be rejected');
    }

    // Reject job
    const updatedJob = await this.jobRepository.update(input.jobId, {
      status: JobStatus.SUSPENDED,
    });

    return mapJobToOutput(updatedJob);
  }
}
