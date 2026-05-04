import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { IPasswordService } from '@shared/domain/services/IPasswordService.js';
import { NotFoundError, AuthenticationError, ValidationError } from '@shared/domain/errors/index.js';
import type { ChangePasswordInputDTO, ChangePasswordOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
  passwordService: IPasswordService;
}

export class ChangePasswordUseCase {
  private readonly userRepository: IUserRepository;
  private readonly passwordService: IPasswordService;

  constructor({ userRepository, passwordService }: Dependencies) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute(input: ChangePasswordInputDTO): Promise<ChangePasswordOutputDTO> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify old password
    const isPasswordValid = await this.passwordService.compare(input.oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Old password is incorrect');
    }

    // Check if new password is different
    if (input.oldPassword === input.newPassword) {
      throw new ValidationError('New password must be different from old password');
    }

    // Validate new password
    const passwordValidation = this.passwordService.validate(input.newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.errors.join(', ') || 'Invalid password');
    }

    // Hash new password
    const passwordHash = await this.passwordService.hash(input.newPassword);

    // Update password
    await this.userRepository.update(input.id, { passwordHash });

    return {
      success: true,
      message: 'Thay đổi mật khẩu thành công',
    };
  }
}
