// src/infrastructure/auth/JWTAuthService.ts
import { AuthService } from '../../domain/services/AuthService';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../shared/config/auth';
import bcrypt from 'bcrypt';

export class JWTAuthService implements AuthService {
  generateToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  }

  verifyToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
      };
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
