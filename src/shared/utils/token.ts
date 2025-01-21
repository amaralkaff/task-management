// src/shared/utils/token.ts
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '24h',
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as TokenPayload;
    if (!decoded || !decoded.userId || !decoded.email) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
}
