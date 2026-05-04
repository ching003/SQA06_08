import type { Request, Response } from 'express';
import { HttpStatus } from '@shared/constants/index.js';

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
  });
};
