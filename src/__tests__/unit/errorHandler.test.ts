// src/__tests__/unit/errorHandler.test.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AuthenticationError } from '../../shared/errors/AppError';
import { errorHandler } from '../../interfaces/http/middleware/errorHandler';

describe('Error Handler', () => {
  // Mock console.error to prevent logging during tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  // Mock request, response, and next function
  const mockRequest = {} as Request;
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle ZodError', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['email'],
        message: 'Email is required',
      },
    ]);

    errorHandler(zodError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Email is required',
    });
  });

  test('should handle AuthenticationError', () => {
    const authError = new AuthenticationError('Unauthorized access');

    errorHandler(authError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized access',
    });
  });

  test('should handle AuthenticationError without message', () => {
    const authError = new AuthenticationError();

    errorHandler(authError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
    });
  });

  test('should handle error with statusCode', () => {
    const error = {
      statusCode: 403,
      message: 'Forbidden access',
    };

    errorHandler(error, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Forbidden access',
    });
  });

  test('should handle unknown errors', () => {
    const error = new Error('Unknown error');

    errorHandler(error, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });

  test('should not log errors in test environment', () => {
    const error = new Error('Test error');
    process.env.NODE_ENV = 'test';

    errorHandler(error, mockRequest, mockResponse, mockNext);
    expect(console.error).not.toHaveBeenCalled();
  });

  test('should log errors in non-test environment', () => {
    const error = new Error('Production error');
    process.env.NODE_ENV = 'production';

    errorHandler(error, mockRequest, mockResponse, mockNext);
    expect(console.error).toHaveBeenCalledWith('Error:', error);

    // Reset NODE_ENV
    process.env.NODE_ENV = 'test';
  });
});
