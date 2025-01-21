import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AuthUseCase } from '../../application/auth/AuthUseCase';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthService } from '../../domain/services/AuthService';
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
} from '../../shared/errors/AppError';

// Mock dependencies
const mockUserRepository: jest.Mocked<UserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
};

const mockAuthService: jest.Mocked<AuthService> = {
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
};

describe('AuthUseCase', () => {
  let authUseCase: AuthUseCase;

  beforeEach(() => {
    authUseCase = new AuthUseCase(mockUserRepository, mockAuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123', // Valid password with uppercase, lowercase, and number
      };

      mockUserRepository.findByEmail.mockResolvedValueOnce(null);
      mockAuthService.hashPassword.mockResolvedValueOnce('hashedPassword');
      mockUserRepository.save.mockImplementationOnce(async (user) => user);
      mockAuthService.generateToken.mockReturnValueOnce('token123');

      const result = await authUseCase.register(
        userData.email,
        userData.password,
        userData.name
      );

      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.getEmail()).toBe(userData.email);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'Password123',
      };

      await expect(
        authUseCase.register(userData.email, userData.password, userData.name)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError for existing email', async () => {
      const userData = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'Password123',
      };

      mockUserRepository.findByEmail.mockResolvedValueOnce(
        new User(
          'user-123',
          userData.email,
          userData.name,
          'hashedPassword',
          new Date(),
          new Date()
        )
      );

      await expect(
        authUseCase.register(userData.email, userData.password, userData.name)
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const user = new User(
        'user-123',
        userData.email,
        'Test User',
        'hashedPassword',
        new Date(),
        new Date()
      );

      mockUserRepository.findByEmail.mockResolvedValueOnce(user);
      mockAuthService.comparePassword.mockResolvedValueOnce(true);
      mockAuthService.generateToken.mockReturnValueOnce('token123');

      const result = await authUseCase.login(userData.email, userData.password);

      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.getEmail()).toBe(userData.email);
      expect(mockAuthService.comparePassword).toHaveBeenCalledWith(
        userData.password,
        user.getPassword()
      );
    });

    it('should throw AuthenticationError for non-existent user', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);

      await expect(
        authUseCase.login('nonexistent@example.com', 'Password123')
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError for incorrect password', async () => {
      const user = new User(
        'user-123',
        'test@example.com',
        'Test User',
        'hashedPassword',
        new Date(),
        new Date()
      );

      mockUserRepository.findByEmail.mockResolvedValueOnce(user);
      mockAuthService.comparePassword.mockResolvedValueOnce(false);

      await expect(
        authUseCase.login('test@example.com', 'WrongPassword123')
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
