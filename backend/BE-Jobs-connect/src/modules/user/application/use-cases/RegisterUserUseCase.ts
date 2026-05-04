import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { IPasswordService } from '@shared/domain/services/IPasswordService.js';
import { ConflictError } from '@shared/domain/errors/index.js';
import { UserStatus } from '../../domain/enums/index.js';
import type { RegisterUserInputDTO, RegisterUserOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
  passwordService: IPasswordService;
}

export class RegisterUserUseCase {
  private readonly userRepository: IUserRepository;
  private readonly passwordService: IPasswordService;

  constructor({ userRepository, passwordService }: Dependencies) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute(input: RegisterUserInputDTO): Promise<RegisterUserOutputDTO> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(input.password);

    // Create user
    const user = await this.userRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName || null,
      phoneNumber: input.phoneNumber || null,
      gender: input.gender || null,
      role: input.role || 'CANDIDATE',
      dateOfBirth: input.dateOfBirth || null,
      status: UserStatus.ACTIVE,
      avatarUrl: null,
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      role: user.role,
      dateOfBirth: user.dateOfBirth,
      status: user.status,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
