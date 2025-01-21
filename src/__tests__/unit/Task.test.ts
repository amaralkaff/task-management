// src/__tests__/unit/Task.test.ts
import { Task, TaskStatus } from '../../domain/entities/Task';

describe('Task Entity', () => {
  const now = new Date();
  const mockTaskData = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending' as TaskStatus,
    dueDate: new Date('2024-01-30'),
    userId: 'user1',
    createdAt: now,
    updatedAt: now,
  };

  test('should create task with all fields', () => {
    const task = new Task(
      mockTaskData.id,
      mockTaskData.title,
      mockTaskData.description,
      mockTaskData.status,
      mockTaskData.dueDate,
      mockTaskData.userId,
      mockTaskData.createdAt,
      mockTaskData.updatedAt
    );

    expect(task.getId()).toBe(mockTaskData.id);
    expect(task.getTitle()).toBe(mockTaskData.title);
    expect(task.getDescription()).toBe(mockTaskData.description);
    expect(task.getStatus()).toBe(mockTaskData.status);
    expect(task.getDueDate()).toEqual(mockTaskData.dueDate);
    expect(task.getUserId()).toBe(mockTaskData.userId);
    expect(task.getCreatedAt()).toBe(mockTaskData.createdAt);
    expect(task.getUpdatedAt()).toBe(mockTaskData.updatedAt);
  });

  test('should create task with minimal required fields', () => {
    const task = new Task(
      '1',
      'Test Task',
      null,
      'pending' as TaskStatus,
      null,
      'user1',
      now,
      now
    );

    expect(task.getId()).toBe('1');
    expect(task.getTitle()).toBe('Test Task');
    expect(task.getDescription()).toBeNull();
    expect(task.getStatus()).toBe('pending');
    expect(task.getDueDate()).toBeNull();
    expect(task.getUserId()).toBe('user1');
  });

  test('should validate task status', () => {
    expect(() => {
      new Task(
        '1',
        'Test Task',
        null,
        'INVALID_STATUS' as TaskStatus,
        null,
        'user1',
        now,
        now
      );
    }).toThrow('Invalid status: INVALID_STATUS');
  });

  test('should accept all valid statuses', () => {
    const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed'];

    validStatuses.forEach((status) => {
      expect(() => {
        new Task('1', 'Test Task', null, status, null, 'user1', now, now);
      }).not.toThrow();
    });
  });

  test('should convert task to JSON format', () => {
    const task = new Task(
      mockTaskData.id,
      mockTaskData.title,
      mockTaskData.description,
      mockTaskData.status,
      mockTaskData.dueDate,
      mockTaskData.userId,
      mockTaskData.createdAt,
      mockTaskData.updatedAt
    );

    const json = task.toJSON();

    expect(json).toEqual({
      id: mockTaskData.id,
      title: mockTaskData.title,
      description: mockTaskData.description,
      status: mockTaskData.status,
      dueDate: mockTaskData.dueDate.toISOString(),
      userId: mockTaskData.userId,
      createdAt: mockTaskData.createdAt.toISOString(),
      updatedAt: mockTaskData.updatedAt.toISOString(),
    });
  });

  test('should handle null dueDate in JSON format', () => {
    const task = new Task(
      '1',
      'Test Task',
      'Description',
      'pending',
      null,
      'user1',
      now,
      now
    );

    const json = task.toJSON();

    expect(json.dueDate).toBeNull();
  });
});
