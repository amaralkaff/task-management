// src/domain/entities/File.ts
import { Entity } from './Entity';

export class File {
  constructor(
    private id: string,
    private taskId: string,
    private filename: string,
    private mimetype: string,
    private size: number,
    private path: string,
    private createdAt: Date
  ) {}

  getId(): string {
    return this.id;
  }
  getTaskId(): string {
    return this.taskId;
  }
  getFilename(): string {
    return this.filename;
  }
  getPath(): string {
    return this.path;
  }
  getMimetype(): string {
    return this.mimetype;
  }
  getSize(): number {
    return this.size;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      taskId: this.taskId,
      filename: this.filename,
      path: this.path,
      mimetype: this.mimetype,
      size: this.size,
      createdAt: this.createdAt,
    };
  }
}
