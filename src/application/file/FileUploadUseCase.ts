import { v4 as uuidv4 } from 'uuid';
import {
  FileRepository,
  FileData,
} from '../../domain/repositories/FileRepository';
import { LocalFileStorageService } from '../../infrastructure/storage/LocalFileStorageService';

// Interface untuk data upload file
interface UploadFileParams {
  taskId: string;
  filename: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

// Interface untuk hasil upload
interface UploadResult {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
}

export class FileUploadUseCase {
  constructor(
    private fileRepository: FileRepository,
    private fileStorageService: LocalFileStorageService
  ) {}

  // Method untuk handle proses upload file
  async execute(params: UploadFileParams): Promise<UploadResult> {
    // Simpan file ke storage
    const savedPath = await this.fileStorageService.store(
      params.filename,
      params.buffer
    );

    // Buat data file untuk disimpan
    const fileData: FileData = {
      id: uuidv4(),
      taskId: params.taskId,
      filename: params.filename,
      path: savedPath,
      mimetype: params.mimetype,
      size: params.size,
    };

    // Simpan ke database
    await this.fileRepository.save(fileData);

    // Return hasil upload
    return {
      id: fileData.id,
      filename: fileData.filename,
      mimetype: fileData.mimetype,
      size: fileData.size,
    };
  }
}
