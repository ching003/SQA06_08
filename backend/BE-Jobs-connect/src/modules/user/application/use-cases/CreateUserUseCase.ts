import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { IPasswordService } from '@shared/domain/services/IPasswordService.js';
import { ConflictError, ValidationError } from '@shared/domain/errors/index.js';
import { UserStatus } from '../../domain/enums/index.js';
import type { CreateUserInputDTO, CreateUserOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
  passwordService: IPasswordService;
}

export class CreateUserUseCase {
  private readonly userRepository: IUserRepository;
  private readonly passwordService: IPasswordService;

  constructor({ userRepository, passwordService }: Dependencies) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute(input: CreateUserInputDTO): Promise<CreateUserOutputDTO> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    // Validate password is provided
    if (!input.password) {
      throw new ValidationError(
        'Password is required. Send password (plain text), backend will hash it automatically.'
      );
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(input.password);

    // Create user
    const user = await this.userRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber || null,
      gender: input.gender || null,
      role: input.role || 'CANDIDATE',
      dateOfBirth: input.dateOfBirth || null,
      status: input.status || UserStatus.ACTIVE,
      avatarUrl: input.avatarUrl || null,
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
