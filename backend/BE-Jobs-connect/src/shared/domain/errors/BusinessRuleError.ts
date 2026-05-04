import { DomainError } from './DomainError.js';

export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message);
  }

  get statusCode(): number {
    return 422;
  }
}
