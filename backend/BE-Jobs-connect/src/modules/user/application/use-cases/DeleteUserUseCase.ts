import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError } from '@shared/domain/errors/index.js';
import type { DeleteUserInputDTO, DeleteUserOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
}

export class DeleteUserUseCase {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: Dependencies) {
    this.userRepository = userRepository;
  }

  async execute(input: DeleteUserInputDTO): Promise<DeleteUserOutputDTO> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.userRepository.delete(input.id);

    return {
      success: true,
      message: 'Xóa người dùng thành công',
    };
  }
}
