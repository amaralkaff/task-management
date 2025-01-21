// src/shared/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

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
        Error: {
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
                  description: 'Pesan error yang spesifik',
                  example: 'Task tidak ditemukan',
                },
                code: {
                  type: 'string',
                  description: 'Kode error',
                  example: 'TASK_NOT_FOUND',
                },
                statusCode: {
                  type: 'integer',
                  description: 'HTTP status code',
                  enum: [400, 401, 403, 404, 409, 422, 500],
                  example: 404,
                },
              },
              required: ['message', 'code', 'statusCode'],
            },
          },
        },
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
        BadRequestError: {
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
                  example: 'File terlalu besar (max 5MB) atau format file tidak didukung',
                },
                code: {
                  type: 'string',
                  example: 'INVALID_FILE',
                },
                statusCode: {
                  type: 'integer',
                  example: 400,
                },
              },
            },
          },
        },
        UnauthorizedError: {
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
                  example: 'Anda harus login terlebih dahulu',
                },
                code: {
                  type: 'string',
                  example: 'UNAUTHORIZED',
                },
                statusCode: {
                  type: 'integer',
                  example: 401,
                },
              },
            },
          },
        },
        InternalServerError: {
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
                  example: 'Gagal menyimpan file ke storage',
                },
                code: {
                  type: 'string',
                  example: 'STORAGE_ERROR',
                },
                statusCode: {
                  type: 'integer',
                  example: 500,
                },
              },
            },
          },
        },
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
