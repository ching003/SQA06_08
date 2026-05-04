export abstract class DomainError extends Error {
  public readonly timestamp: Date;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  abstract get statusCode(): number;
}
