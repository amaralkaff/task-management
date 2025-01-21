// src/interfaces/setup/dependencySetup.ts
import { MySQLUserRepository } from '../../infrastructure/persistence/mysql/MySQLUserRepository';
import { MySQLTaskRepository } from '../../infrastructure/persistence/mysql/MySQLTaskRepository';
import { MySQLFileRepository } from '../../infrastructure/persistence/mysql/MySQLFileRepository';
import { JWTAuthService } from '../../infrastructure/auth/JWTAuthService';
import { LocalFileStorageService } from '../../infrastructure/storage/LocalFileStorageService';
import { AuthUseCase } from '../../application/auth/AuthUseCase';
import { TaskUseCase } from '../../application/task/TaskUseCase';
import { FileUploadUseCase } from '../../application/file/FileUploadUseCase';
import { UserResolver } from '../../interfaces/graphql/resolvers/UserResolver';
import { TaskResolver } from '../../interfaces/graphql/resolvers/TaskResolver';
import { FileUploadController } from '../../interfaces/http/controllers/FileUploadController';
import { ServerDependencies } from './types';

export function initializeDependencies(): ServerDependencies {
  // objek repository untuk akses database
  const userRepository = new MySQLUserRepository();
  const taskRepository = new MySQLTaskRepository();
  const fileRepository = new MySQLFileRepository();

  // service untuk auth dan file
  const authService = new JWTAuthService();
  const fileStorageService = new LocalFileStorageService();

  // use case untuk logic bisnis
  const authUseCase = new AuthUseCase(userRepository, authService);
  const taskUseCase = new TaskUseCase(taskRepository);
  const fileUploadUseCase = new FileUploadUseCase(fileRepository, fileStorageService);

  // resolver untuk handle request GraphQL
  const userResolver = new UserResolver(authUseCase);
  const taskResolver = new TaskResolver(taskUseCase);

  // controller untuk upload file
  const fileUploadController = new FileUploadController(fileUploadUseCase);

  return {
    userRepository,
    taskRepository,
    fileRepository,
    authService,
    fileStorageService,
    authUseCase,
    taskUseCase,
    fileUploadUseCase,
    userResolver,
    taskResolver,
    fileUploadController,
  };
}
