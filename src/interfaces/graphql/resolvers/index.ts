// src/interfaces/graphql/resolvers/index.ts
import { UserResolver } from './UserResolver';
import { TaskResolver } from './TaskResolver';

export const createResolvers = (
  userResolver: UserResolver,
  taskResolver: TaskResolver
) => {
  return {
    Task: {
      ...taskResolver.resolvers.Task,
    },
    Query: {
      ...userResolver.resolvers.Query,
      ...taskResolver.resolvers.Query,
    },
    Mutation: {
      ...userResolver.resolvers.Mutation,
      ...taskResolver.resolvers.Mutation,
    },
  };
};
