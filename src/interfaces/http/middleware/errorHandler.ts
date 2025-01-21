// src/interfaces/http/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AuthenticationError } from '../../../shared/errors/AppError';

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Only log errors if not in test environment
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', error);
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: error.errors[0].message,
    });
  }

  // Handle authentication errors
  if (error instanceof AuthenticationError) {
    return res.status(401).json({
      error: error.message || 'Unauthorized',
    });
  }

  // Handle other known errors
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    error: 'Internal server error',
  });
};
