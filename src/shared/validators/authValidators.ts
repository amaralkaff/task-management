import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must be less than 255 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});
