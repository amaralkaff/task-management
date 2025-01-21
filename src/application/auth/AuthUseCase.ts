// src/application/auth/AuthUseCase.ts
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthService } from '../../domain/services/AuthService';
import {
  AuthenticationError,
  ConflictError,
  ValidationError,
} from '../../shared/errors/AppError';
import {
  loginSchema,
  registerSchema,
} from '../../shared/validators/authValidators';
import { v4 as uuidv4 } from 'uuid';

export class AuthUseCase {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService
  ) {}

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ token: string; user: User }> {
    // Validate input
    const validationResult = registerSchema.safeParse({
      email,
      password,
      name,
    });

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.message);
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(password);

    // Create user
    const user = new User(
      uuidv4(),
      email,
      name,
      hashedPassword,
      new Date(),
      new Date()
    );

    const savedUser = await this.userRepository.save(user);
    const token = this.authService.generateToken({
      userId: savedUser.getId(),
      email: savedUser.getEmail(),
    });

    return { token, user: savedUser };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    // Validate input
    const validationResult = loginSchema.safeParse({
      email,
      password,
    });

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.message);
    }

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.authService.comparePassword(
      password,
      user.getPassword()
    );
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate token
    const token = this.authService.generateToken({
      userId: user.getId(),
      email: user.getEmail(),
    });

    return { token, user };
  }
}
