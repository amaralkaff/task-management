import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { MySQLFileRepository } from '../../../src/infrastructure/persistence/mysql/MySQLFileRepository';
import { pool } from '../../../src/shared/config/database';

// Mock database pool
jest.mock('../../../src/shared/config/database', () => ({
  pool: {
    execute: jest.fn(),
  },
}));

describe('MySQLFileRepository', () => {
  let repository: MySQLFileRepository;
  const mockFile = {
    id: 'file-123',
    taskId: 'task-123',
    filename: 'test.txt',
    path: '/path/to/file',
    mimetype: 'text/plain',
    size: 1024,
    createdAt: new Date(),
  };

  beforeEach(() => {
    repository = new MySQLFileRepository();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return file when found', async () => {
      const mockRow = {
        id: mockFile.id,
        task_id: mockFile.taskId,
        filename: mockFile.filename,
        path: mockFile.path,
        mimetype: mockFile.mimetype,
        size: mockFile.size,
        created_at: mockFile.createdAt,
      };

      jest
        .spyOn(pool, 'execute')
        .mockResolvedValueOnce([[mockRow], null] as any);

      const result = await repository.findById(mockFile.id);
      expect(result).toBeDefined();
      expect(result?.getId()).toBe(mockFile.id);
      expect(pool.execute).toHaveBeenCalledWith(expect.any(String), [
        mockFile.id,
      ]);
    });

    it('should return null when file not found', async () => {
      jest.spyOn(pool, 'execute').mockResolvedValueOnce([[], null] as any);

      const result = await repository.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findByTaskId', () => {
    it('should return files for task', async () => {
      const mockRow = {
        id: mockFile.id,
        task_id: mockFile.taskId,
        filename: mockFile.filename,
        path: mockFile.path,
        mimetype: mockFile.mimetype,
        size: mockFile.size,
        created_at: mockFile.createdAt,
      };

      jest
        .spyOn(pool, 'execute')
        .mockResolvedValueOnce([[mockRow], null] as any);

      const results = await repository.findByTaskId(mockFile.taskId);
      expect(results).toHaveLength(1);
      expect(results[0].getTaskId()).toBe(mockFile.taskId);
      expect(pool.execute).toHaveBeenCalledWith(expect.any(String), [
        mockFile.taskId,
      ]);
    });

    it('should return empty array when no files found', async () => {
      jest.spyOn(pool, 'execute').mockResolvedValueOnce([[], null] as any);

      const results = await repository.findByTaskId('non-existent');
      expect(results).toHaveLength(0);
    });
  });

  describe('save', () => {
    it('should save file data', async () => {
      jest
        .spyOn(pool, 'execute')
        .mockResolvedValueOnce([[{ insertId: 1 }], null] as any);

      const result = await repository.save(mockFile);
      expect(result).toEqual(mockFile);
      expect(pool.execute).toHaveBeenCalledWith(expect.any(String), [
        mockFile.id,
        mockFile.taskId,
        mockFile.filename,
        mockFile.path,
        mockFile.mimetype,
        mockFile.size,
      ]);
    });
  });

  describe('delete', () => {
    it('should delete file', async () => {
      jest
        .spyOn(pool, 'execute')
        .mockResolvedValueOnce([[{ affectedRows: 1 }], null] as any);

      await repository.delete(mockFile.id);
      expect(pool.execute).toHaveBeenCalledWith(expect.any(String), [
        mockFile.id,
      ]);
    });
  });
});
