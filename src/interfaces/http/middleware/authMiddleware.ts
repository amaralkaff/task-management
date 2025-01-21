// src/interfaces/http/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../../shared/utils/token';
import { AuthenticationError } from '../../../shared/errors/AppError';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // Skip auth check for login and register mutations
  if (
    req.body?.query?.includes('login') ||
    req.body?.query?.includes('register')
  ) {
    return next();
  }

  if (!authHeader) {
    return next(new AuthenticationError('Unauthorized'));
  }

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer') {
    return next(new AuthenticationError('Unauthorized'));
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (error) {
    next(new AuthenticationError('Unauthorized'));
  }
};
