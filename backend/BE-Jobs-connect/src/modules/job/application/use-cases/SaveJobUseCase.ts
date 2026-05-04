import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { ISavedJobRepository } from '../../domain/repositories/ISavedJobRepository.js';
import type { SaveJobInputDTO, SaveJobOutputDTO } from '../dtos/index.js';
import { SavedJob } from '../../domain/entities/SavedJob.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { NotFoundError, ConflictError, AuthorizationError } from '@shared/domain/errors/index.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
  savedJobRepository: ISavedJobRepository;
}

export class SaveJobUseCase {
  private readonly jobRepository: IJobRepository;
  private readonly savedJobRepository: ISavedJobRepository;

  constructor({ jobRepository, savedJobRepository }: Dependencies) {
    this.jobRepository = jobRepository;
    this.savedJobRepository = savedJobRepository;
  }

  async execute(input: SaveJobInputDTO): Promise<SaveJobOutputDTO> {
    // Check if user is CANDIDATE
    if (input.userRole !== UserRole.CANDIDATE) {
      throw new AuthorizationError('Only candidates can save jobs');
    }

    // Check if job exists
    const job = await this.jobRepository.findByIdWithRelations(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Check if already saved
    const existingSaved = await this.savedJobRepository.findByUserAndJob(
      input.userId,
      input.jobId
    );
    if (existingSaved) {
      throw new ConflictError('Job already saved');
    }

    // Create saved job
    const savedJob = new SavedJob({
      userId: input.userId,
      jobId: input.jobId,
      createdAt: new Date(),
    });

    const saved = await this.savedJobRepository.save(savedJob);

    return {
      id: saved.id!,
      jobId: saved.jobId,
      userId: saved.userId,
      createdAt: saved.createdAt!,
      job: mapJobToOutput(job),
    };
  }
}
