// src/shared/validators/taskValidators.ts
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).nullable(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  dueDate: z
    .string()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      {
        message: 'Invalid date format',
      }
    )
    .transform((val) => (val ? new Date(val) : null)),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  dueDate: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      {
        message: 'Invalid date format',
      }
    )
    .transform((val) => (val ? new Date(val) : null)),
});
