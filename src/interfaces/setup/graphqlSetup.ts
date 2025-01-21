import { Express } from 'express';
import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '../graphql/schema/typeDefs';
import { createResolvers } from '../graphql/resolvers/index';
import { ServerDependencies } from './types';

export function setupGraphQL(app: Express, deps: ServerDependencies) {
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