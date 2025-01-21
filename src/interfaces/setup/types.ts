import { MySQLUserRepository } from '../../infrastructure/persistence/mysql/MySQLUserRepository';
import { MySQLTaskRepository } from '../../infrastructure/persistence/mysql/MySQLTaskRepository';
import { MySQLFileRepository } from '../../infrastructure/persistence/mysql/MySQLFileRepository';
import { JWTAuthService } from '../../infrastructure/auth/JWTAuthService';
import { LocalFileStorageService } from '../../infrastructure/storage/LocalFileStorageService';
import { AuthUseCase } from '../../application/auth/AuthUseCase';
import { TaskUseCase } from '../../application/task/TaskUseCase';
import { FileUploadUseCase } from '../../application/file/FileUploadUseCase';
import { UserResolver } from '../graphql/resolvers/UserResolver';
import { TaskResolver } from '../graphql/resolvers/TaskResolver';
import { FileUploadController } from '../http/controllers/FileUploadController';

export interface ServerDependencies {
  userRepository: MySQLUserRepository;
  taskRepository: MySQLTaskRepository;
  fileRepository: MySQLFileRepository;
  authService: JWTAuthService;
  fileStorageService: LocalFileStorageService;
  authUseCase: AuthUseCase;
  taskUseCase: TaskUseCase;
  fileUploadUseCase: FileUploadUseCase;
  userResolver: UserResolver;
  taskResolver: TaskResolver;
  fileUploadController: FileUploadController;
}
