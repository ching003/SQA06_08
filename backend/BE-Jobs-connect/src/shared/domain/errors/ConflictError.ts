import { DomainError } from './DomainError.js';

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }

  get statusCode(): number {
    return 409;
  }
}
