// src/server.ts
import express, { Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './shared/config/swagger';
import { errorHandler } from './interfaces/http/middleware/errorHandler';
import { setupGraphQL } from './interfaces/setup/graphqlSetup';
import { setupFileUpload } from './interfaces/setup/fileUploadSetup';
import { initializeDependencies } from './interfaces/setup/dependencySetup';

export async function createServer(): Promise<Express> {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Konfigurasi timeout dan keep-alive
  app.use((req, res, next) => {
    // Meningkatkan timeout
    req.setTimeout(30000);
    res.setTimeout(30000);
    
    // Menambahkan header keep-alive
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=30');
    
    next();
  });

  // Initialize all dependencies
  const dependencies = initializeDependencies();

  // Setup GraphQL
  setupGraphQL(app, dependencies);

  // Setup File Upload
  setupFileUpload(app, dependencies);

  // Error handling
  app.use(errorHandler);

  return app;
}
