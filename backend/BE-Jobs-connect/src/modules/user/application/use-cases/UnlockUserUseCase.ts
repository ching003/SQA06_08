import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole, UserStatus } from '../../domain/enums/index.js';
import type { UnlockUserInputDTO, LockUnlockUserOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
}

export class UnlockUserUseCase {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: Dependencies) {
    this.userRepository = userRepository;
  }

  async execute(input: UnlockUserInputDTO): Promise<LockUnlockUserOutputDTO> {
    // Check if user to unlock exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check admin authorization
    const admin = await this.userRepository.findById(input.adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Unauthorized. Admin access required.');
    }

    // Unlock the user (set to ACTIVE)
    const updatedUser = await this.userRepository.updateStatus(input.userId, UserStatus.ACTIVE);

    return {
      id: updatedUser.id,
      status: updatedUser.status,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
