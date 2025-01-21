// src/domain/entities/Task.ts
import { Entity } from './Entity';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

const VALID_STATUSES = ['pending', 'in_progress', 'completed'] as const;

export class Task extends Entity {
  constructor(
    id: string,
    private readonly title: string,
    private readonly description: string | null,
    private readonly status: TaskStatus,
    private readonly dueDate: Date | null,
    private readonly userId: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date
  ) {
    super(id);
    this.validateStatus(status);
  }

  private validateStatus(status: string): void {
    if (!VALID_STATUSES.includes(status as TaskStatus)) {
      throw new Error(`Invalid status: ${status}`);
    }
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null {
    return this.description;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  getDueDate(): Date | null {
    return this.dueDate;
  }

  getUserId(): string {
    return this.userId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      dueDate: this.dueDate?.toISOString() || null,
      userId: this.userId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
