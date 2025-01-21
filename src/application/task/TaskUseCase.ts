// src/application/task/TaskUseCase.ts
import { Task, TaskStatus } from '../../domain/entities/Task';
import { TaskRepository } from '../../domain/repositories/TaskRepository';
import {
  NotFoundError,
  ValidationError,
  AuthenticationError,
} from '../../shared/errors/AppError';
import {
  createTaskSchema,
  updateTaskSchema,
} from '../../shared/validators/taskValidators';
import { v4 as uuidv4 } from 'uuid';

export class TaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async createTask(
    userId: string,
    title: string,
    description: string | null,
    status: TaskStatus,
    dueDate: string | null
  ): Promise<Task> {
    // Validate input
    const validationResult = createTaskSchema.safeParse({
      title,
      description,
      status,
      dueDate,
    });

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.message);
    }

    const task = new Task(
      uuidv4(),
      title,
      description,
      status,
      dueDate ? new Date(dueDate) : null,
      userId,
      new Date(),
      new Date()
    );

    return this.taskRepository.save(task);
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    return this.taskRepository.findByUserId(userId);
  }

  async getTask(id: string): Promise<Task> {
    if (!id) {
      throw new ValidationError('Task ID is required');
    }

    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }
    return task;
  }

  async updateTask(
    id: string,
    userId: string,
    updates: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      dueDate?: string | null;
    }
  ): Promise<Task> {
    // Validate input
    const validationResult = updateTaskSchema.safeParse({
      ...updates,
      dueDate: updates.dueDate,
    });

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.message);
    }

    const existingTask = await this.getTask(id);

    if (existingTask.getUserId() !== userId) {
      throw new AuthenticationError('You can only update your own tasks');
    }

    const updatedTask = new Task(
      existingTask.getId(),
      updates.title || existingTask.getTitle(),
      updates.description !== undefined
        ? updates.description
        : existingTask.getDescription(),
      updates.status || existingTask.getStatus(),
      updates.dueDate !== undefined
        ? updates.dueDate
          ? new Date(updates.dueDate)
          : null
        : existingTask.getDueDate(),
      existingTask.getUserId(),
      existingTask.getCreatedAt(),
      new Date()
    );

    return this.taskRepository.save(updatedTask);
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    if (!id) {
      throw new ValidationError('Task ID is required');
    }

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }

    if (task.getUserId() !== userId) {
      throw new AuthenticationError('You can only delete your own tasks');
    }

    await this.taskRepository.delete(id);
  }
}
