// src/domain/repositories/TaskRepository.ts
import { Task } from '../entities/Task';

export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findByUserId(userId: string): Promise<Task[]>;
  save(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
}
