import { DomainError } from './DomainError.js';

export class AuthorizationError extends DomainError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message);
  }

  get statusCode(): number {
    return 403;
  }
}
