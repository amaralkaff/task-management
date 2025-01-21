import express, { Express } from 'express';
import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import { typeDefs } from './interfaces/graphql/schema/typeDefs';
import { createResolvers } from './interfaces/graphql/resolvers/index';
import { authMiddleware } from './interfaces/http/middleware/authMiddleware';
import { errorHandler } from './interfaces/http/middleware/errorHandler';
import { upload } from './interfaces/http/middleware/upload';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './shared/config/swagger';

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

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // GraphQL Schema Documentation
  app.get('/graphql-docs', (_, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Task Management API - GraphQL Documentation</title>
        <script src="https://cdn.jsdelivr.net/npm/graphql-voyager/dist/voyager.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/graphql-voyager/dist/voyager.css" />
        <style>
          body { height: 100vh; margin: 0; }
          #voyager { height: 100%; }
        </style>
      </head>
      <body>
        <div id="voyager">Loading...</div>
        <script>
          const voyager = new window.GraphQLVoyager.Voyager({
            introspection: async () => {
              const response = await fetch('/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  query: \`
                    query IntrospectionQuery {
                      __schema {
                        queryType { name }
                        mutationType { name }
                        types {
                          ...FullType
                        }
                      }
                    }
                    fragment FullType on __Type {
                      kind
                      name
                      description
                      fields(includeDeprecated: true) {
                        name
                        description
                        args {
                          ...InputValue
                        }
                        type {
                          ...TypeRef
                        }
                        isDeprecated
                        deprecationReason
                      }
                      inputFields {
                        ...InputValue
                      }
                      interfaces {
                        ...TypeRef
                      }
                      enumValues(includeDeprecated: true) {
                        name
                        description
                        isDeprecated
                        deprecationReason
                      }
                      possibleTypes {
                        ...TypeRef
                      }
                    }
                    fragment InputValue on __InputValue {
                      name
                      description
                      type { ...TypeRef }
                      defaultValue
                    }
                    fragment TypeRef on __Type {
                      kind
                      name
                      ofType {
                        kind
                        name
                        ofType {
                          kind
                          name
                          ofType {
                            kind
                            name
                            ofType {
                              kind
                              name
                              ofType {
                                kind
                                name
                                ofType {
                                  kind
                                  name
                                  ofType {
                                    kind
                                    name
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  \`
                })
              });
              return response.json();
            },
            workerURI: 'https://cdn.jsdelivr.net/npm/graphql-voyager/dist/voyager.worker.min.js',
            displayOptions: {
              skipRelay: false,
              skipDeprecated: false,
              showLeafFields: true,
            },
          });
          document.getElementById('voyager').innerHTML = '';
          voyager.renderTo('#voyager');
        </script>
      </body>
      </html>
    `);
  });

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

  // Menangani kasus koneksi terputus
  app.use((req, res, next) => {
    req.on('close', () => {
      // Clean up resources if needed
    });
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
