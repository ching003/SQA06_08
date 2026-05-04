import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError } from '@shared/domain/errors/index.js';
import type { GetUserInfoOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
}

export class GetUserInfoUseCase {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: Dependencies) {
    this.userRepository = userRepository;
  }

  async execute(id: string): Promise<GetUserInfoOutputDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      role: user.role,
      dateOfBirth: user.dateOfBirth,
      avatarUrl: user.avatarUrl,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}
