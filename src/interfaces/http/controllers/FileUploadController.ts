import { Request, Response } from 'express';
import { FileUploadUseCase } from '../../../application/file/FileUploadUseCase';

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload file untuk task
 *     description: Upload file dan lampirkan ke task tertentu
 *     tags: [Files]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File yang akan diupload (max 5MB)
 *               taskId:
 *                 type: string
 *                 description: ID task yang akan dilampiri file
 *             required:
 *               - file
 *               - taskId
 *     responses:
 *       200:
 *         description: File berhasil diupload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: file-123
 *                     filename:
 *                       type: string
 *                       example: document.pdf
 *                     mimetype:
 *                       type: string
 *                       example: application/pdf
 *                     size:
 *                       type: number
 *                       example: 1048576
 *                     taskId:
 *                       type: string
 *                       example: task-123
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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
