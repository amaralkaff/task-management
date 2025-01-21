// src/interfaces/http/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../../shared/utils/token';
import { AuthenticationError } from '../../../shared/errors/AppError';
import { RequestHandler } from 'express';

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

export const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Skip auth check for login and register mutations
  if (
    req.body?.query?.includes('login') ||
    req.body?.query?.includes('register')
  ) {
    return next();
  }

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization type' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
