import type { Request, Response, NextFunction } from 'express';
import { DomainError } from '@shared/domain/errors/index.js';
import { HttpStatus } from '@shared/constants/index.js';

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  stack?: string;
}

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', error);

  // Handle Domain Errors
  if (error instanceof DomainError) {
    const response: ErrorResponse = {
      success: false,
      message: error.message,
    };

    // Add validation errors if available
    if ('errors' in error && Array.isArray((error as { errors?: string[] }).errors)) {
      response.errors = (error as { errors: string[] }).errors;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
      response.stack = error.stack;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle other errors
  const response: ErrorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
};
