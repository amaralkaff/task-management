// src/interfaces/graphql/types/context.ts

export interface Context {
  user?: {
    id: string;
    email: string;
  };
}
