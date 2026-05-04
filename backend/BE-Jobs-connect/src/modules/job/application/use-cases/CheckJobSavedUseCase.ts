import type { ISavedJobRepository } from '../../domain/repositories/ISavedJobRepository.js';
import type { CheckJobSavedInputDTO, CheckJobSavedOutputDTO } from '../dtos/index.js';

interface Dependencies {
  savedJobRepository: ISavedJobRepository;
}

export class CheckJobSavedUseCase {
  private readonly savedJobRepository: ISavedJobRepository;

  constructor({ savedJobRepository }: Dependencies) {
    this.savedJobRepository = savedJobRepository;
  }

  async execute(input: CheckJobSavedInputDTO): Promise<CheckJobSavedOutputDTO> {
    const isSaved = await this.savedJobRepository.isJobSaved(input.userId, input.jobId);

    return {
      isSaved,
    };
  }
}
