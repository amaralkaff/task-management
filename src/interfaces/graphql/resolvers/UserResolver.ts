// src/interfaces/graphql/resolvers/UserResolver.ts
import { AuthUseCase } from '../../../application/auth/AuthUseCase';
import { Context } from '../types/context';
import { AuthenticationError } from '../../../shared/errors/AppError';

export class UserResolver {
  constructor(private authUseCase: AuthUseCase) {}

  resolvers = {
    Query: {
      me: async (_: any, __: any, context: Context) => {
        if (!context.user) {
          throw new AuthenticationError();
        }
        // Implementation will come from use case
        return null;
      },
    },

    Mutation: {
      register: async (_: any, { input }: { input: any }) => {
        return this.authUseCase.register(
          input.email,
          input.password,
          input.name
        );
      },

      login: async (_: any, { input }: { input: any }) => {
        return this.authUseCase.login(input.email, input.password);
      },
    },
  };
}
