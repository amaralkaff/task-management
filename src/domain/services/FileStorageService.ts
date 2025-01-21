// src/domain/services/FileStorageService.ts
import { Buffer } from 'buffer';

export interface FileStorageService {
  store(filename: string, buffer: Buffer): Promise<string>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}
