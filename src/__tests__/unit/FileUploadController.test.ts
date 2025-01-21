// src/__tests__/unit/FileUploadController.test.ts
import { Request, Response } from 'express';
import { FileUploadController } from '../../../src/interfaces/http/controllers/FileUploadController';
import { FileUploadUseCase } from '../../../src/application/file/FileUploadUseCase';
import { FileRepository } from '../../../src/domain/repositories/FileRepository';
import { FileStorageService } from '../../../src/domain/services/FileStorageService';
import { AppError } from '../../../src/shared/errors/AppError';

// Define custom interface for authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  file?: Express.Multer.File;
}

// Mock FileUploadUseCase
const mockUploadFile = jest.fn();
jest.mock('../../application/file/FileUploadUseCase', () => {
  return {
    FileUploadUseCase: jest.fn().mockImplementation(() => ({
      uploadFile: mockUploadFile,
      execute: mockUploadFile,
    })),
  };
});

describe('FileUploadController', () => {
  let mockResponse: Response;
  let mockFileRepository: FileRepository;
  let mockFileStorageService: FileStorageService;
  let fileUploadUseCase: FileUploadUseCase;
  let controller: FileUploadController;
  let mockExecute: jest.SpyInstance;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    mockFileRepository = {} as FileRepository;
    mockFileStorageService = {} as FileStorageService;
    fileUploadUseCase = new FileUploadUseCase(
      mockFileRepository,
      mockFileStorageService
    );
    mockExecute = jest.spyOn(fileUploadUseCase, 'execute');
    controller = new FileUploadController(fileUploadUseCase);
  });

  afterEach(() => {
    mockExecute.mockReset();
  });

  test('should handle successful file upload', async () => {
    const mockFile = {
      buffer: Buffer.from([115, 116]),
      originalname: 'test.txt',
      mimetype: 'text/plain',
      size: 1024,
    } as Express.Multer.File;

    const mockUploadResult = {
      id: 'file-123',
      filename: 'test.txt',
      mimetype: 'text/plain',
      size: 1024,
    };
    mockExecute.mockResolvedValue(mockUploadResult);

    const mockRequest = {
      file: mockFile,
      body: { taskId: 'task-123' },
      user: { id: 'user-123', email: 'test@example.com' },
    } as unknown as AuthenticatedRequest;

    await controller.uploadFile(mockRequest, mockResponse);

    expect(mockExecute).toHaveBeenCalledWith({
      taskId: 'task-123',
      filename: 'test.txt',
      buffer: mockFile.buffer,
      mimetype: 'text/plain',
      size: 1024,
    });
    expect(mockResponse.json).toHaveBeenCalledWith(mockUploadResult);
  });

  test('should handle missing taskId', async () => {
    const mockFile = {
      buffer: Buffer.from([115, 116]),
      originalname: 'test.txt',
      mimetype: 'text/plain',
      size: 1024,
    } as Express.Multer.File;

    const mockRequest = {
      file: mockFile,
      body: {},
      user: { id: 'user-123', email: 'test@example.com' },
    } as unknown as AuthenticatedRequest;

    await controller.uploadFile(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Task ID is required',
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  test('should handle upload error', async () => {
    const mockFile = {
      buffer: Buffer.from([115, 116]),
      originalname: 'test.txt',
      mimetype: 'text/plain',
      size: 1024,
    } as Express.Multer.File;

    const error = new AppError('Upload failed', 400);
    mockExecute.mockRejectedValue(error);

    const mockRequest = {
      file: mockFile,
      body: { taskId: 'task-123' },
      user: { id: 'user-123', email: 'test@example.com' },
    } as unknown as AuthenticatedRequest;

    await controller.uploadFile(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Failed to upload file',
    });
  });
});
