import { DomainError } from './DomainError.js';

export class NotFoundError extends DomainError {
  public readonly resource: string;

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message);
    this.resource = resource;
  }

  get statusCode(): number {
    return 404;
  }
}
