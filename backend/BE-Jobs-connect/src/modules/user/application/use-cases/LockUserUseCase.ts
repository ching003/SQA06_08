import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole, UserStatus } from '../../domain/enums/index.js';
import type { LockUserInputDTO, LockUnlockUserOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
}

export class LockUserUseCase {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: Dependencies) {
    this.userRepository = userRepository;
  }

  async execute(input: LockUserInputDTO): Promise<LockUnlockUserOutputDTO> {
    // Check if user to lock exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check admin authorization
    const admin = await this.userRepository.findById(input.adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Unauthorized. Admin access required.');
    }

    // Lock the user
    const updatedUser = await this.userRepository.updateStatus(input.userId, UserStatus.LOCKED);

    return {
      id: updatedUser.id,
      status: updatedUser.status,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
