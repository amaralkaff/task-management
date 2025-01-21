import { FileRepository } from '../../domain/repositories/FileRepository';
import { FileStorageService } from '../../domain/services/FileStorageService';
import { TaskRepository } from '../../domain/repositories/TaskRepository';
import { File } from '../../domain/entities/File';
import { v4 as uuidv4 } from 'uuid';
import {
  NotFoundError,
  AuthenticationError,
  ValidationError,
} from '../../shared/errors/AppError';

// Konstanta untuk validasi file
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
];

export class FileUseCase {
  constructor(
    private fileRepository: FileRepository,
    private fileStorageService: FileStorageService,
    private taskRepository: TaskRepository
  ) {}

  async uploadFile(
    taskId: string,
    userId: string,
    filename: string,
    mimetype: string,
    size: number,
    buffer: Buffer
  ): Promise<File> {
    // Validasi nama file
    if (!filename.trim()) {
      throw new ValidationError('Filename cannot be empty');
    }

    // Validasi ukuran file
    if (size <= 0 || size > MAX_FILE_SIZE) {
      throw new ValidationError('Invalid file size');
    }

    // Validasi tipe file
    if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
      throw new ValidationError('File type not allowed');
    }

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (task.getUserId() !== userId) {
      throw new AuthenticationError('Not authorized to upload to this task');
    }

    const path = await this.fileStorageService.store(filename, buffer);
    const file = new File(
      uuidv4(),
      taskId,
      filename,
      mimetype,
      size,
      path,
      new Date()
    );

    await this.fileRepository.save(file.toJSON());
    return file;
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    const task = await this.taskRepository.findById(file.getTaskId());
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (task.getUserId() !== userId) {
      throw new AuthenticationError('Not authorized to delete this file');
    }

    await this.fileStorageService.delete(file.getPath());
    await this.fileRepository.delete(fileId);
  }
}
