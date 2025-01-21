import { Request, Response } from 'express';
import { FileUploadUseCase } from '../../../application/file/FileUploadUseCase';

// Tipe data untuk request upload yang sudah terautentikasi
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  file?: Express.Multer.File;
}

export class FileUploadController {
  constructor(private fileUploadUseCase: FileUploadUseCase) {}

  // Method untuk handle upload file
  async uploadFile(req: AuthenticatedRequest, res: Response) {
    try {
      // Cek apakah user sudah login
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Cek apakah ada file yang diupload
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Cek apakah task ID ada
      if (!req.body.taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      // Proses upload file
      const result = await this.fileUploadUseCase.execute({
        taskId: req.body.taskId,
        filename: req.file.originalname,
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      return res.json(result);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Failed to upload file' });
    }
  }
}
