import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError } from '@shared/domain/errors/index.js';
import type { UpdateProfileInputDTO, UpdateProfileOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
}

export class UpdateProfileUseCase {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: Dependencies) {
    this.userRepository = userRepository;
  }

  async execute(input: UpdateProfileInputDTO): Promise<UpdateProfileOutputDTO> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updateData: Record<string, unknown> = {};
    if (input.fullName !== undefined) updateData.fullName = input.fullName;
    if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber;
    if (input.gender !== undefined) updateData.gender = input.gender;
    if (input.dateOfBirth !== undefined) updateData.dateOfBirth = input.dateOfBirth;

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
