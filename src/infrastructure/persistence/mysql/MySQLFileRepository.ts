import {
  FileRepository,
  FileData,
} from '../../../domain/repositories/FileRepository';
import { File } from '../../../domain/entities/File';
import { pool } from '../../../shared/config/database';

export class MySQLFileRepository implements FileRepository {
  // Cari file berdasarkan ID
  async findById(id: string): Promise<File | null> {
    const [rows] = await pool.execute('SELECT * FROM files WHERE id = ?', [id]);

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const file = rows[0] as any;
    return new File(
      file.id,
      file.task_id,
      file.filename,
      file.mimetype,
      file.size,
      file.path,
      new Date(file.created_at)
    );
  }

  // Cari file berdasarkan task ID
  async findByTaskId(taskId: string): Promise<File[]> {
    const [rows] = await pool.execute('SELECT * FROM files WHERE task_id = ?', [
      taskId,
    ]);

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map(
      (file: any) =>
        new File(
          file.id,
          file.task_id,
          file.filename,
          file.mimetype,
          file.size,
          file.path,
          new Date(file.created_at)
        )
    );
  }

  // Simpan file ke database
  async save(fileData: FileData): Promise<FileData> {
    await pool.execute(
      'INSERT INTO files (id, task_id, filename, path, mimetype, size) VALUES (?, ?, ?, ?, ?, ?)',
      [
        fileData.id,
        fileData.taskId,
        fileData.filename,
        fileData.path,
        fileData.mimetype,
        fileData.size,
      ]
    );
    return fileData;
  }

  // Hapus file dari database
  async delete(id: string): Promise<void> {
    await pool.execute('DELETE FROM files WHERE id = ?', [id]);
  }
}
