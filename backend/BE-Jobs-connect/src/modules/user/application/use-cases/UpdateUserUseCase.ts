import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError } from '@shared/domain/errors/index.js';
import type { UpdateUserInputDTO, UpdateUserOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
}

export class UpdateUserUseCase {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: Dependencies) {
    this.userRepository = userRepository;
  }

  async execute(input: UpdateUserInputDTO): Promise<UpdateUserOutputDTO> {
    // Check if user exists
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Build update data - only role and status can be updated by admin
    const updateData: Record<string, unknown> = {};
    if (input.role !== undefined) updateData.role = input.role;
    if (input.status !== undefined) updateData.status = input.status;

    const updatedUser = await this.userRepository.update(input.id, updateData);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phoneNumber: updatedUser.phoneNumber,
      gender: updatedUser.gender,
      role: updatedUser.role,
      dateOfBirth: updatedUser.dateOfBirth,
      status: updatedUser.status,
      avatarUrl: updatedUser.avatarUrl,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
