import bcrypt from 'bcrypt';
import type { IPasswordService } from '../../domain/services/IPasswordService.js';

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

export class BcryptPasswordService implements IPasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
