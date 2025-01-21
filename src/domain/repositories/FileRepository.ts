// src/domain/repositories/FileRepository.ts
import { File } from '../entities/File';

// Interface untuk data file yang akan disimpan
export interface FileData {
  id: string;
  taskId: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

// Interface untuk repository file
export interface FileRepository {
  findById(id: string): Promise<File | null>;
  findByTaskId(taskId: string): Promise<File[]>;
  save(fileData: FileData): Promise<FileData>;
  delete(id: string): Promise<void>;
}
