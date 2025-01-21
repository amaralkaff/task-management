// src/__tests__/unit/FileUseCase.test.ts
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { FileUseCase } from '../../../src/application/file/FileUseCase';
import { File } from '../../../src/domain/entities/File';
import { FileRepository } from '../../../src/domain/repositories/FileRepository';
import { FileStorageService } from '../../../src/domain/services/FileStorageService';
import { TaskRepository } from '../../../src/domain/repositories/TaskRepository';
import { Task } from '../../../src/domain/entities/Task';
import {
  ValidationError,
  NotFoundError,
  AuthenticationError,
} from '../../../src/shared/errors/AppError';

// Mock dependencies
const mockFileRepository: jest.Mocked<FileRepository> = {
  findById: jest.fn(),
  findByTaskId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockFileStorageService: jest.Mocked<FileStorageService> = {
  store: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
};

const mockTaskRepository: jest.Mocked<TaskRepository> = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('FileUseCase', () => {
  let fileUseCase: FileUseCase;

  beforeEach(() => {
    fileUseCase = new FileUseCase(
      mockFileRepository,
      mockFileStorageService,
      mockTaskRepository
    );
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const fileData = {
        taskId: 'task-123',
        userId: 'user-123',
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('test content'),
      };

      const task = new Task(
        fileData.taskId,
        'Test Task',
        'Description',
        'pending',
        new Date(),
        fileData.userId,
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValueOnce(task);
      mockFileStorageService.store.mockResolvedValueOnce(
        'stored/path/test.txt'
      );
      mockFileRepository.save.mockImplementationOnce(async (file) => file);

      const result = await fileUseCase.uploadFile(
        fileData.taskId,
        fileData.userId,
        fileData.originalname,
        fileData.mimetype,
        fileData.size,
        fileData.buffer
      );

      expect(result).toBeDefined();
      expect(result.getFilename()).toBe(fileData.originalname);
      expect(mockFileStorageService.store).toHaveBeenCalled();
      expect(mockFileRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundError for non-existent task', async () => {
      mockTaskRepository.findById.mockResolvedValueOnce(null);

      await expect(
        fileUseCase.uploadFile(
          'non-existent',
          'user-123',
          'test.txt',
          'text/plain',
          1024,
          Buffer.from('test')
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthenticationError for unauthorized upload', async () => {
      const task = new Task(
        'task-123',
        'Test Task',
        'Description',
        'pending',
        new Date(),
        'other-user',
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValueOnce(task);

      await expect(
        fileUseCase.uploadFile(
          'task-123',
          'user-123',
          'test.txt',
          'text/plain',
          1024,
          Buffer.from('test')
        )
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw ValidationError for invalid file size', async () => {
      await expect(
        fileUseCase.uploadFile(
          'task-123',
          'user-123',
          'test.txt',
          'text/plain',
          0, // ukuran file tidak valid
          Buffer.from('test')
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid file type', async () => {
      await expect(
        fileUseCase.uploadFile(
          'task-123',
          'user-123',
          'test.exe',
          'application/x-msdownload', // tipe file tidak diizinkan
          1024,
          Buffer.from('test')
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty filename', async () => {
      await expect(
        fileUseCase.uploadFile(
          'task-123',
          'user-123',
          '', // nama file kosong
          'text/plain',
          1024,
          Buffer.from('test')
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const file = new File(
        'file-123',
        'task-123',
        'test.txt',
        'text/plain',
        1024,
        'stored/path/test.txt',
        new Date()
      );

      const task = new Task(
        'task-123',
        'Test Task',
        'Description',
        'pending',
        new Date(),
        'user-123',
        new Date(),
        new Date()
      );

      mockFileRepository.findById.mockResolvedValueOnce(file);
      mockTaskRepository.findById.mockResolvedValueOnce(task);
      mockFileStorageService.delete.mockResolvedValueOnce();
      mockFileRepository.delete.mockResolvedValueOnce();

      await expect(
        fileUseCase.deleteFile('file-123', 'user-123')
      ).resolves.not.toThrow();

      expect(mockFileStorageService.delete).toHaveBeenCalled();
      expect(mockFileRepository.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError for non-existent file', async () => {
      mockFileRepository.findById.mockResolvedValueOnce(null);

      await expect(
        fileUseCase.deleteFile('non-existent', 'user-123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthenticationError for unauthorized delete', async () => {
      const file = new File(
        'file-123',
        'task-123',
        'test.txt',
        'text/plain',
        1024,
        'stored/path/test.txt',
        new Date()
      );

      const task = new Task(
        'task-123',
        'Test Task',
        'Description',
        'pending',
        new Date(),
        'other-user',
        new Date(),
        new Date()
      );

      mockFileRepository.findById.mockResolvedValueOnce(file);
      mockTaskRepository.findById.mockResolvedValueOnce(task);

      await expect(
        fileUseCase.deleteFile('file-123', 'user-123')
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
