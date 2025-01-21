// src/interfaces/graphql/types/context.ts
import { User } from '../../../domain/entities/User';

export interface Context {
  user?: {
    id: string;
    email: string;
  };
}
