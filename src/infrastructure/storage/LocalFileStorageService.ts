// src/infrastructure/storage/LocalFileStorageService.ts
import { FileStorageService } from '../../domain/services/FileStorageService';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export class LocalFileStorageService implements FileStorageService {
  async store(filename: string, buffer: Buffer): Promise<string> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const uniqueFilename = `${Date.now()}-${filename}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  async delete(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
