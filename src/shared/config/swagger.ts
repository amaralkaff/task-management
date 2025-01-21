// src/shared/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import { AppError } from '../errors/AppError';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API Documentation', 
      version: '1.0.0',
      description: 'Dokumentasi API untuk Task Management System',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        FileUploadResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: 'file-123',
                },
                filename: {
                  type: 'string',
                  example: 'document.pdf',
                },
                mimetype: {
                  type: 'string',
                  example: 'application/pdf', 
                },
                size: {
                  type: 'number',
                  example: 1048576,
                },
                taskId: {
                  type: 'string',
                  example: 'task-123',
                },
              },
            },
          },
        },
        AppError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Task tidak ditemukan',
                },
                code: {
                  type: 'string',
                  example: 'TASK_NOT_FOUND',
                },
                statusCode: {
                  type: 'integer',
                  example: 404,
                },
                details: {
                  type: 'object',
                  example: null,
                  description: 'Informasi tambahan tentang error (opsional)'
                }
              },
              required: ['message', 'code', 'statusCode'],
            },
          },
        },
        BadRequestError: {
          allOf: [
            { $ref: '#/components/schemas/AppError' }
          ],
          example: {
            success: false,
            error: {
              message: 'Data yang diberikan tidak valid',
              code: 'INVALID_INPUT',
              statusCode: 400
            }
          }
        },
        UnauthorizedError: {
          allOf: [
            { $ref: '#/components/schemas/AppError' }
          ],
          example: {
            success: false,
            error: {
              message: 'Token tidak valid atau kadaluarsa',
              code: 'INVALID_TOKEN',
              statusCode: 401
            }
          }
        },
        InternalServerError: {
          allOf: [
            { $ref: '#/components/schemas/AppError' }
          ],
          example: {
            success: false,
            error: {
              message: 'Terjadi kesalahan internal server',
              code: 'INTERNAL_SERVER_ERROR',
              statusCode: 500
            }
          }
        }
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/interfaces/http/controllers/*.ts', './src/interfaces/http/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
