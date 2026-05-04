import { DomainError } from './DomainError.js';

export class AuthenticationError extends DomainError {
  constructor(message: string = 'Authentication failed') {
    super(message);
  }

  get statusCode(): number {
    return 401;
  }
}
