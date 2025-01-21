// src/shared/utils/password.ts
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error('Password cannot be empty');
  }
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  if (!plainPassword || !hashedPassword) {
    throw new Error('Password and hashed password are required');
  }
  return bcrypt.compare(plainPassword, hashedPassword);
}
