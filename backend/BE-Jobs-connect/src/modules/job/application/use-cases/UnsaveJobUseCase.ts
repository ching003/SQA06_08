import type { ISavedJobRepository } from '../../domain/repositories/ISavedJobRepository.js';
import type { UnsaveJobInputDTO, UnsaveJobOutputDTO } from '../dtos/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';

interface Dependencies {
  savedJobRepository: ISavedJobRepository;
}

export class UnsaveJobUseCase {
  private readonly savedJobRepository: ISavedJobRepository;

  constructor({ savedJobRepository }: Dependencies) {
    this.savedJobRepository = savedJobRepository;
  }

  async execute(input: UnsaveJobInputDTO): Promise<UnsaveJobOutputDTO> {
    // Check if user is CANDIDATE
    if (input.userRole !== UserRole.CANDIDATE) {
      throw new AuthorizationError('Only candidates can unsave jobs');
    }

    // Check if saved job exists
    const savedJob = await this.savedJobRepository.findByUserAndJob(
      input.userId,
      input.jobId
    );

    if (!savedJob) {
      throw new NotFoundError('Saved job not found');
    }

    // Delete saved job
    await this.savedJobRepository.deleteByUserAndJob(input.userId, input.jobId);

    return {
      success: true,
      message: 'Bỏ lưu tin tuyển dụng thành công',
    };
  }
}
