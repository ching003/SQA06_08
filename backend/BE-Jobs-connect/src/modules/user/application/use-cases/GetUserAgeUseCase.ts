import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError, BusinessRuleError } from '@shared/domain/errors/index.js';
import type { GetUserAgeOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
}

export class GetUserAgeUseCase {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: Dependencies) {
    this.userRepository = userRepository;
  }

  async execute(id: string): Promise<GetUserAgeOutputDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.dateOfBirth) {
      throw new BusinessRuleError('Date of birth is not set');
    }

    const age = this.calculateAge(user.dateOfBirth);

    return { age };
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
