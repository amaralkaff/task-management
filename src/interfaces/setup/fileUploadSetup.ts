// src/interfaces/setup/fileUploadSetup.ts
import { Express } from 'express';
import { authMiddleware } from '../http/middleware/authMiddleware';
import { upload } from '../http/middleware/upload';
import { ServerDependencies } from './types';

export function setupFileUpload(app: Express, deps: ServerDependencies) {
  app.post('/upload', authMiddleware, upload.single('file'), (req, res) =>
    deps.fileUploadController.uploadFile(req, res),
  );
}
