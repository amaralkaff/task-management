// src/domain/services/AuthService.ts
import { User } from '../entities/User';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthService {
  generateToken(payload: { userId: string; email: string }): string;
  verifyToken(token: string): { userId: string; email: string };
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}
