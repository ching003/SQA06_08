import { DomainError } from './DomainError.js';

export class ValidationError extends DomainError {
  public readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.errors = errors;
  }

  get statusCode(): number {
    return 400;
  }
}
