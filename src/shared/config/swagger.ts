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
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Pesan error yang spesifik',
                  example: 'File tidak ditemukan'
                },
                code: {
                  type: 'string',
                  description: 'Kode error',
                  example: 'FILE_NOT_FOUND'
                },
                statusCode: {
                  type: 'integer',
                  description: 'HTTP status code',
                  enum: [400, 401, 404, 409, 500],
                  example: 404
                }
              },
              required: ['message', 'code', 'statusCode']
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