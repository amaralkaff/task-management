import { hashPassword, comparePasswords } from '../../shared/utils/password';

describe('Password Utils', () => {
  test('should hash password correctly', async () => {
    const password = 'TestPassword123';
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword.length).toBeGreaterThan(0);
  });

  test('should verify password correctly', async () => {
    const password = 'TestPassword123';
    const hashedPassword = await hashPassword(password);
    const isValid = await comparePasswords(password, hashedPassword);
    expect(isValid).toBe(true);
  });

  test('should reject invalid password', async () => {
    const password = 'TestPassword123';
    const wrongPassword = 'WrongPassword123';
    const hashedPassword = await hashPassword(password);
    const isValid = await comparePasswords(wrongPassword, hashedPassword);
    expect(isValid).toBe(false);
  });

  test('should handle empty password', async () => {
    const password = '';
    await expect(hashPassword(password)).rejects.toThrow();
  });

  test('should handle undefined password', async () => {
    await expect(hashPassword(undefined as any)).rejects.toThrow();
  });
});
