import { TaskResolver } from '../../interfaces/graphql/resolvers/TaskResolver';
import { TaskUseCase } from '../../application/task/TaskUseCase';
import { Task } from '../../domain/entities/Task';
import { AppError } from '../../shared/errors/AppError';
import { MySQLTaskRepository } from '../../infrastructure/persistence/mysql/MySQLTaskRepository';
import { Context } from '../../interfaces/graphql/types/context';
import { pool } from '../../shared/config/database';

// Mock dependencies
jest.mock('../../application/task/TaskUseCase');
jest.mock('../../infrastructure/persistence/mysql/MySQLTaskRepository');
jest.mock('../../shared/config/database', () => ({
  pool: {
    execute: jest.fn(),
  },
}));

describe('TaskResolver', () => {
  let resolver: TaskResolver;
  let useCase: jest.Mocked<TaskUseCase>;
  let taskRepository: jest.Mocked<MySQLTaskRepository>;

  const mockContext: Context = {
    user: {
      id: '1',
      email: 'test@example.com',
    },
  };

  const unauthenticatedContext: Context = {
    user: undefined,
  };

  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    due_date: new Date(),
    user_id: '1',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    taskRepository =
      new MySQLTaskRepository() as jest.Mocked<MySQLTaskRepository>;
    useCase = new TaskUseCase(taskRepository) as jest.Mocked<TaskUseCase>;
    resolver = new TaskResolver(useCase);
    jest.clearAllMocks();
  });

  describe('Query.tasks', () => {
    const mockTasks = [
      mockTask,
      {
        id: '2',
        title: 'Second Task',
        description: 'Another Description',
        status: 'in_progress',
        due_date: new Date(),
        user_id: '1',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    beforeEach(() => {
      (pool.execute as jest.Mock).mockResolvedValue([mockTasks]);
    });

    test('should return user tasks', async () => {
      const result = await resolver.resolvers.Query.tasks(
        null,
        {},
        mockContext
      );
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
        [mockContext.user!.id]
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Task);
    });

    test('should filter tasks by status', async () => {
      const filter = { filterByStatus: 'pending' };
      await resolver.resolvers.Query.tasks(null, { filter }, mockContext);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
        [mockContext.user!.id, filter.filterByStatus]
      );
    });

    test('should filter tasks by search term', async () => {
      const filter = { search: 'Test' };
      await resolver.resolvers.Query.tasks(null, { filter }, mockContext);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE user_id = ? AND (title LIKE ? OR description LIKE ? OR status LIKE ? OR DATE_FORMAT(due_date, "%Y-%m-%d") LIKE ?) ORDER BY created_at DESC',
        [mockContext.user!.id, '%Test%', '%Test%', '%Test%', '%Test%']
      );
    });

    test('should filter tasks by due date', async () => {
      const dueDate = new Date();
      const filter = { filterByDueDate: dueDate };
      await resolver.resolvers.Query.tasks(null, { filter }, mockContext);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE user_id = ? AND DATE(due_date) = DATE(?) ORDER BY created_at DESC',
        [mockContext.user!.id, filter.filterByDueDate]
      );
    });

    test('should throw error when user is not authenticated', async () => {
      await expect(
        resolver.resolvers.Query.tasks(null, {}, unauthenticatedContext)
      ).rejects.toThrow(AppError);
    });
  });

  describe('Query.task', () => {
    beforeEach(() => {
      useCase.getTask = jest.fn().mockResolvedValue(mockTask);
    });

    test('should return task by id', async () => {
      const result = await resolver.resolvers.Query.task(
        null,
        { id: '1' },
        mockContext
      );
      expect(useCase.getTask).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockTask);
    });

    test('should throw error when task not found', async () => {
      useCase.getTask = jest
        .fn()
        .mockRejectedValue(new AppError('Task not found', 404));
      await expect(
        resolver.resolvers.Query.task(null, { id: '999' }, mockContext)
      ).rejects.toThrow(AppError);
    });

    test('should throw error when user is not authenticated', async () => {
      await expect(
        resolver.resolvers.Query.task(null, { id: '1' }, unauthenticatedContext)
      ).rejects.toThrow(AppError);
    });
  });

  describe('Mutation.createTask', () => {
    const createTaskInput = {
      title: 'New Task',
      description: 'New Description',
      status: 'TODO',
      dueDate: new Date().toISOString(),
    };

    beforeEach(() => {
      useCase.createTask = jest.fn().mockResolvedValue(mockTask);
    });

    test('should create task with valid input', async () => {
      const result = await resolver.resolvers.Mutation.createTask(
        null,
        { input: createTaskInput },
        mockContext
      );

      expect(useCase.createTask).toHaveBeenCalledWith(
        mockContext.user!.id,
        createTaskInput.title,
        createTaskInput.description,
        createTaskInput.status,
        createTaskInput.dueDate
      );
      expect(result).toEqual(mockTask);
    });

    test('should throw error when user is not authenticated', async () => {
      await expect(
        resolver.resolvers.Mutation.createTask(
          null,
          { input: createTaskInput },
          unauthenticatedContext
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('Mutation.updateTask', () => {
    const updateTaskInput = {
      title: 'Updated Task',
      status: 'IN_PROGRESS',
    };

    beforeEach(() => {
      useCase.updateTask = jest.fn().mockResolvedValue({
        ...mockTask,
        ...updateTaskInput,
      });
    });

    test('should update task with valid input', async () => {
      const result = await resolver.resolvers.Mutation.updateTask(
        null,
        { id: '1', input: updateTaskInput },
        mockContext
      );

      expect(useCase.updateTask).toHaveBeenCalledWith(
        '1',
        mockContext.user!.id,
        updateTaskInput
      );
      expect(result).toEqual({
        ...mockTask,
        ...updateTaskInput,
      });
    });

    test('should throw error when task not found', async () => {
      useCase.updateTask = jest
        .fn()
        .mockRejectedValue(new AppError('Task not found', 404));
      await expect(
        resolver.resolvers.Mutation.updateTask(
          null,
          { id: '999', input: updateTaskInput },
          mockContext
        )
      ).rejects.toThrow(AppError);
    });

    test('should throw error when user is not authenticated', async () => {
      await expect(
        resolver.resolvers.Mutation.updateTask(
          null,
          { id: '1', input: updateTaskInput },
          unauthenticatedContext
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('Mutation.deleteTask', () => {
    beforeEach(() => {
      useCase.deleteTask = jest.fn().mockResolvedValue(undefined);
    });

    test('should delete task successfully', async () => {
      const result = await resolver.resolvers.Mutation.deleteTask(
        null,
        { id: '1' },
        mockContext
      );

      expect(useCase.deleteTask).toHaveBeenCalledWith(
        '1',
        mockContext.user!.id
      );
      expect(result).toBe(true);
    });

    test('should throw error when task not found', async () => {
      useCase.deleteTask = jest
        .fn()
        .mockRejectedValue(new AppError('Task not found', 404));
      await expect(
        resolver.resolvers.Mutation.deleteTask(null, { id: '999' }, mockContext)
      ).rejects.toThrow(AppError);
    });

    test('should throw error when user is not authenticated', async () => {
      await expect(
        resolver.resolvers.Mutation.deleteTask(
          null,
          { id: '1' },
          unauthenticatedContext
        )
      ).rejects.toThrow(AppError);
    });
  });
});
