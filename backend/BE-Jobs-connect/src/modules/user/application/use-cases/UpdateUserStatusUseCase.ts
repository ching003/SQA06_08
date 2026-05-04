import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError, ValidationError } from '@shared/domain/errors/index.js';
import { UserStatus } from '../../domain/enums/index.js';
import type { UpdateUserStatusInputDTO, UpdateUserStatusOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
}

export class UpdateUserStatusUseCase {
  private static readonly VALID_STATUSES = Object.values(UserStatus);
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: Dependencies) {
    this.userRepository = userRepository;
  }

  async execute(input: UpdateUserStatusInputDTO): Promise<UpdateUserStatusOutputDTO> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate status value
    if (!UpdateUserStatusUseCase.VALID_STATUSES.includes(input.status)) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${UpdateUserStatusUseCase.VALID_STATUSES.join(', ')}`
      );
    }

    const updatedUser = await this.userRepository.updateStatus(input.id, input.status);

    return {
      id: updatedUser.id,
      status: updatedUser.status,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
