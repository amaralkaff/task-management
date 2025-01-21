// src/__tests__/unit/TaskUseCase.test.ts
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TaskUseCase } from '../../application/task/TaskUseCase';
import { Task, TaskStatus } from '../../domain/entities/Task';
import { TaskRepository } from '../../domain/repositories/TaskRepository';
import {
  ValidationError,
  NotFoundError,
  AuthenticationError,
} from '../../shared/errors/AppError';

// Mock TaskRepository
const mockTaskRepository: jest.Mocked<TaskRepository> = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('TaskUseCase', () => {
  let taskUseCase: TaskUseCase;

  beforeEach(() => {
    taskUseCase = new TaskUseCase(mockTaskRepository);
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        userId: 'user-123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date().toISOString(),
      };

      mockTaskRepository.save.mockResolvedValueOnce(
        new Task(
          'task-123',
          taskData.title,
          taskData.description,
          'pending' as TaskStatus,
          taskData.dueDate ? new Date(taskData.dueDate) : null,
          taskData.userId,
          new Date(),
          new Date()
        )
      );

      const result = await taskUseCase.createTask(
        taskData.userId,
        taskData.title,
        taskData.description,
        'pending' as TaskStatus,
        taskData.dueDate
      );

      expect(result).toBeDefined();
      expect(result.getTitle()).toBe(taskData.title);
      expect(mockTaskRepository.save).toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid title', async () => {
      const taskData = {
        userId: 'user-123',
        title: '', // Invalid title
        description: 'Test Description',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date().toISOString(),
      };

      await expect(
        taskUseCase.createTask(
          taskData.userId,
          taskData.title,
          taskData.description,
          'pending' as TaskStatus,
          taskData.dueDate
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should create task with null dueDate', async () => {
      const taskData = {
        userId: 'user-123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending' as TaskStatus,
      };

      mockTaskRepository.save.mockResolvedValueOnce(
        new Task(
          'task-123',
          taskData.title,
          taskData.description,
          taskData.status,
          null,
          taskData.userId,
          new Date(),
          new Date()
        )
      );

      const result = await taskUseCase.createTask(
        taskData.userId,
        taskData.title,
        taskData.description,
        taskData.status,
        null
      );

      expect(result).toBeDefined();
      expect(result.getDueDate()).toBeNull();
    });

    it('should throw ValidationError for invalid date format', async () => {
      const taskData = {
        userId: 'user-123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending' as TaskStatus,
        dueDate: 'invalid-date',
      };

      await expect(
        taskUseCase.createTask(
          taskData.userId,
          taskData.title,
          taskData.description,
          taskData.status,
          taskData.dueDate
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getTask', () => {
    it('should return task by id', async () => {
      const task = new Task(
        'task-123',
        'Test Task',
        'Description',
        'pending' as TaskStatus,
        new Date(),
        'user-123',
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValueOnce(task);

      const result = await taskUseCase.getTask('task-123');
      expect(result).toBeDefined();
      expect(result.getId()).toBe('task-123');
    });

    it('should throw NotFoundError for non-existent task', async () => {
      mockTaskRepository.findById.mockResolvedValueOnce(null);

      await expect(taskUseCase.getTask('non-existent')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const existingTask = new Task(
        'task-123',
        'Original Title',
        'Original Description',
        'pending' as TaskStatus,
        new Date(),
        'user-123',
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValueOnce(existingTask);
      mockTaskRepository.save.mockImplementationOnce(async (task) => task);

      const updates = {
        title: 'Updated Title',
        status: 'in_progress' as TaskStatus,
      };

      const result = await taskUseCase.updateTask(
        'task-123',
        'user-123',
        updates
      );

      expect(result.getTitle()).toBe(updates.title);
      expect(result.getStatus()).toBe(updates.status);
    });

    it('should throw AuthenticationError for unauthorized update', async () => {
      const existingTask = new Task(
        'task-123',
        'Original Title',
        'Original Description',
        'pending' as TaskStatus,
        new Date(),
        'other-user',
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValueOnce(existingTask);

      await expect(
        taskUseCase.updateTask('task-123', 'user-123', { title: 'New Title' })
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw ValidationError for invalid status update', async () => {
      const existingTask = new Task(
        'task-123',
        'Original Title',
        'Original Description',
        'pending' as TaskStatus,
        new Date(),
        'user-123',
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValueOnce(existingTask);

      await expect(
        taskUseCase.updateTask('task-123', 'user-123', {
          status: 'invalid_status' as TaskStatus,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid due date format in update', async () => {
      const existingTask = new Task(
        'task-123',
        'Original Title',
        'Original Description',
        'pending' as TaskStatus,
        new Date(),
        'user-123',
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValueOnce(existingTask);

      await expect(
        taskUseCase.updateTask('task-123', 'user-123', {
          dueDate: 'invalid-date',
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const existingTask = new Task(
        'task-123',
        'Test Task',
        'Description',
        'pending' as TaskStatus,
        new Date(),
        'user-123',
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValueOnce(existingTask);
      mockTaskRepository.delete.mockResolvedValueOnce();

      await expect(
        taskUseCase.deleteTask('task-123', 'user-123')
      ).resolves.not.toThrow();
      expect(mockTaskRepository.delete).toHaveBeenCalledWith('task-123');
    });

    it('should throw AuthenticationError for unauthorized delete', async () => {
      const existingTask = new Task(
        'task-123',
        'Test Task',
        'Description',
        'pending' as TaskStatus,
        new Date(),
        'other-user', // Different user
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValueOnce(existingTask);
      mockTaskRepository.delete.mockRejectedValueOnce(
        new AuthenticationError('You can only delete your own tasks')
      );

      await expect(
        taskUseCase.deleteTask('task-123', 'user-123')
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw NotFoundError for non-existent task', async () => {
      mockTaskRepository.findById.mockResolvedValueOnce(null);
      mockTaskRepository.delete.mockRejectedValueOnce(
        new NotFoundError('Task with id non-existent not found')
      );

      await expect(
        taskUseCase.deleteTask('non-existent', 'user-123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for missing task ID', async () => {
      try {
        await taskUseCase.deleteTask('', 'user-123');
        fail('Expected ValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for missing user ID', async () => {
      try {
        await taskUseCase.deleteTask('task-123', '');
        fail('Expected ValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getUserTasks', () => {
    it('should return tasks for a user', async () => {
      const tasks = [
        new Task(
          'task-1',
          'Task 1',
          'Description 1',
          'pending' as TaskStatus,
          new Date(),
          'user-123',
          new Date(),
          new Date()
        ),
        new Task(
          'task-2',
          'Task 2',
          'Description 2',
          'completed' as TaskStatus,
          null,
          'user-123',
          new Date(),
          new Date()
        ),
      ];

      mockTaskRepository.findByUserId.mockResolvedValueOnce(tasks);

      const result = await taskUseCase.getUserTasks('user-123');
      expect(result).toHaveLength(2);
      expect(result[0].getId()).toBe('task-1');
      expect(result[1].getId()).toBe('task-2');
    });

    it('should return empty array when user has no tasks', async () => {
      mockTaskRepository.findByUserId.mockResolvedValueOnce([]);

      const result = await taskUseCase.getUserTasks('user-123');
      expect(result).toHaveLength(0);
    });
  });
});
