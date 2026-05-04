import type { ISavedCVRepository } from '../../domain/repositories/ISavedCVRepository.js';
import type { CheckCVSavedInputDTO, CheckCVSavedOutputDTO } from '../dtos/index.js';

interface Dependencies {
  savedCVRepository: ISavedCVRepository;
}

export class CheckCVSavedUseCase {
  private readonly savedCVRepository: ISavedCVRepository;

  constructor({ savedCVRepository }: Dependencies) {
    this.savedCVRepository = savedCVRepository;
  }

  async execute(input: CheckCVSavedInputDTO): Promise<CheckCVSavedOutputDTO> {
    const isSaved = await this.savedCVRepository.isCVSaved(input.userId, input.cvId);

    return {
      isSaved,
    };
  }
}
