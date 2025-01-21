import express, { Express } from 'express';
import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import { typeDefs } from './interfaces/graphql/schema/typeDefs';
import { createResolvers } from './interfaces/graphql/resolvers/index';
import { authMiddleware } from './interfaces/http/middleware/authMiddleware';
import { errorHandler } from './interfaces/http/middleware/errorHandler';
import { upload } from './interfaces/http/middleware/upload';

// Repositories
import { MySQLUserRepository } from './infrastructure/persistence/mysql/MySQLUserRepository';
import { MySQLTaskRepository } from './infrastructure/persistence/mysql/MySQLTaskRepository';
import { MySQLFileRepository } from './infrastructure/persistence/mysql/MySQLFileRepository';

// Services
import { JWTAuthService } from './infrastructure/auth/JWTAuthService';
import { LocalFileStorageService } from './infrastructure/storage/LocalFileStorageService';

// Use Cases
import { AuthUseCase } from './application/auth/AuthUseCase';
import { TaskUseCase } from './application/task/TaskUseCase';
import { FileUploadUseCase } from './application/file/FileUploadUseCase';

// Resolvers
import { UserResolver } from './interfaces/graphql/resolvers/UserResolver';
import { TaskResolver } from './interfaces/graphql/resolvers/TaskResolver';

// Controllers
import { FileUploadController } from './interfaces/http/controllers/FileUploadController';

interface ServerDependencies {
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

function initializeDependencies(): ServerDependencies {
  // Buat objek repository untuk akses database
  const userRepository = new MySQLUserRepository();
  const taskRepository = new MySQLTaskRepository();
  const fileRepository = new MySQLFileRepository();

  // Buat service untuk auth dan file
  const authService = new JWTAuthService();
  const fileStorageService = new LocalFileStorageService();

  // Buat use case untuk logic bisnis
  const authUseCase = new AuthUseCase(userRepository, authService);
  const taskUseCase = new TaskUseCase(taskRepository);
  const fileUploadUseCase = new FileUploadUseCase(
    fileRepository,
    fileStorageService
  );

  // Buat resolver untuk handle request GraphQL
  const userResolver = new UserResolver(authUseCase);
  const taskResolver = new TaskResolver(taskUseCase);

  // Buat controller untuk upload file
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

function setupGraphQL(app: Express, deps: ServerDependencies) {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: createResolvers(deps.userResolver, deps.taskResolver),
  });

  const yoga = createYoga({
    schema,
    context: async ({ request }) => {
      const authHeader = request.headers.get('authorization');
      const body = await request.json().catch(() => ({}));
      const query = body?.query || '';

      if (query.includes('login') || query.includes('register')) {
        return { user: null };
      }

      if (!authHeader) {
        return { user: null };
      }

      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer') {
        return { user: null };
      }

      try {
        const decoded = deps.authService.verifyToken(token);
        const user = await deps.userRepository.findById(decoded.userId);
        if (!user) {
          return { user: null };
        }
        return {
          user: {
            id: user.getId(),
            email: user.getEmail(),
          },
        };
      } catch (error) {
        return { user: null };
      }
    },
    maskedErrors: false,
    graphiql: true,
    landingPage: false,
    batching: true,
  });

  app.use('/graphql', yoga);
}

function setupFileUpload(app: Express, deps: ServerDependencies) {
  app.post('/upload', authMiddleware, upload.single('file'), (req, res) =>
    deps.fileUploadController.uploadFile(req, res)
  );
}

export async function createServer(): Promise<Express> {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

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
