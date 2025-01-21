// src/__tests__/unit/UserResolver.test.ts
import { UserResolver } from '../../interfaces/graphql/resolvers/UserResolver';
import { AuthenticationError } from '../../shared/errors/AppError';
import { User } from '../../domain/entities/User';
import { Context } from '../../interfaces/graphql/types/context';

describe('UserResolver', () => {
  const mockUser = new User(
    '1',
    'test@example.com',
    'Test User',
    'hashedPassword',
    new Date(),
    new Date()
  );

  const mockAuthUseCase = {
    register: jest.fn(),
    login: jest.fn(),
    findById: jest.fn(),
  };

  const resolver = new UserResolver(mockAuthUseCase as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query.me', () => {
    test('should throw error for unauthenticated user', async () => {
      const context = { user: undefined } as Context;

      await expect(
        resolver.resolvers.Query.me(null, null, context)
      ).rejects.toThrow(AuthenticationError);
    });

    test('should return null when user is authenticated but not found', async () => {
      const context = {
        user: {
          id: '1',
          email: 'test@example.com',
        },
      } as Context;

      mockAuthUseCase.findById.mockResolvedValue(null);

      const result = await resolver.resolvers.Query.me(null, null, context);
      expect(result).toBeNull();
    });

    test('should return user data when authenticated and found', async () => {
      const context = {
        user: {
          id: '1',
          email: 'test@example.com',
        },
      } as Context;

      mockAuthUseCase.findById.mockResolvedValue(mockUser);

      const result = await resolver.resolvers.Query.me(null, null, context);
      expect(result).toBeDefined();
      if (result) {
        expect((result as any).id).toBe(mockUser.getId());
        expect((result as any).email).toBe(mockUser.getEmail());
      }
    });
  });

  describe('Mutation.register', () => {
    const registerInput = {
      email: 'new@example.com',
      password: 'Password123',
      name: 'New User',
    };

    test('should register new user successfully', async () => {
      mockAuthUseCase.register.mockResolvedValue({
        token: 'jwt-token',
        user: mockUser,
      });

      const result = await resolver.resolvers.Mutation.register(null, {
        input: registerInput,
      });

      expect(mockAuthUseCase.register).toHaveBeenCalledWith(
        registerInput.email,
        registerInput.password,
        registerInput.name
      );
      expect(result.token).toBe('jwt-token');
      expect(result.user).toBe(mockUser);
    });

    test('should handle registration error', async () => {
      const error = new Error('Email already exists');
      mockAuthUseCase.register.mockRejectedValue(error);

      await expect(
        resolver.resolvers.Mutation.register(null, { input: registerInput })
      ).rejects.toThrow(error);
    });
  });

  describe('Mutation.login', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'Password123',
    };

    test('should login user successfully', async () => {
      mockAuthUseCase.login.mockResolvedValue({
        token: 'jwt-token',
        user: mockUser,
      });

      const result = await resolver.resolvers.Mutation.login(null, {
        input: loginInput,
      });

      expect(mockAuthUseCase.login).toHaveBeenCalledWith(
        loginInput.email,
        loginInput.password
      );
      expect(result.token).toBe('jwt-token');
      expect(result.user).toBe(mockUser);
    });

    test('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      mockAuthUseCase.login.mockRejectedValue(error);

      await expect(
        resolver.resolvers.Mutation.login(null, { input: loginInput })
      ).rejects.toThrow(error);
    });
  });
});
