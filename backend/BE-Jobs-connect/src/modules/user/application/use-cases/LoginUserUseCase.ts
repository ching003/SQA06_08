import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { IPasswordService } from '@shared/domain/services/IPasswordService.js';
import type { ITokenService } from '@shared/domain/services/ITokenService.js';
import { AuthenticationError, BusinessRuleError } from '@shared/domain/errors/index.js';
import { UserStatus } from '../../domain/enums/index.js';
import type { LoginUserInputDTO, LoginUserOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
  passwordService: IPasswordService;
  tokenService: ITokenService;
}

export class LoginUserUseCase {
  private readonly userRepository: IUserRepository;
  private readonly passwordService: IPasswordService;
  private readonly tokenService: ITokenService;

  constructor({ userRepository, passwordService, tokenService }: Dependencies) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  async execute(input: LoginUserInputDTO): Promise<LoginUserOutputDTO> {
    // Find user by email
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check account status
    if (user.status !== UserStatus.ACTIVE) {
      const statusMessages: Record<string, string> = {
        [UserStatus.LOCKED]: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
        [UserStatus.SUSPENDED]: 'Tài khoản của bạn đã bị tạm ngưng. Vui lòng liên hệ quản trị viên.',
        [UserStatus.INACTIVE]: 'Tài khoản của bạn không hoạt động. Vui lòng liên hệ quản trị viên.',
        [UserStatus.PENDING]: 'Tài khoản của bạn đang chờ duyệt. Vui lòng liên hệ quản trị viên.',
      };
      const message = statusMessages[user.status] || 'Tài khoản không hoạt động. Vui lòng liên hệ quản trị viên.';
      throw new BusinessRuleError(message);
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate token
    const token = this.tokenService.generate({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
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
      },
      token,
      expiresIn: this.tokenService.getExpiresIn(),
    };
  }
}
