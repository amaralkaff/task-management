// src/infrastructure/persistence/mysql/MySQLTaskRepository.ts
import { Task, TaskStatus } from '../../../domain/entities/Task';
import { TaskRepository } from '../../../domain/repositories/TaskRepository';
import { pool } from '../../../shared/config/database';
import { NotFoundError } from '../../../shared/errors/AppError';

export class MySQLTaskRepository implements TaskRepository {
  async findById(id: string): Promise<Task | null> {
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return new Task(
      row.id,
      row.title,
      row.description,
      row.status as TaskStatus,
      row.due_date,
      row.user_id,
      row.created_at,
      row.updated_at
    );
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map(
      (row: any) =>
        new Task(
          row.id,
          row.title,
          row.description,
          row.status as TaskStatus,
          row.due_date,
          row.user_id,
          row.created_at,
          row.updated_at
        )
    );
  }

  async save(task: Task): Promise<Task> {
    const existingTask = await this.findById(task.getId());

    if (existingTask) {
      // Update
      await pool.execute(
        `UPDATE tasks 
         SET title = ?, description = ?, status = ?, 
             due_date = ?, user_id = ?
         WHERE id = ?`,
        [
          task.getTitle(),
          task.getDescription(),
          task.getStatus(),
          task.getDueDate(),
          task.getUserId(),
          task.getId(),
        ]
      );
    } else {
      // Insert
      await pool.execute(
        `INSERT INTO tasks 
         (id, title, description, status, due_date, user_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          task.getId(),
          task.getTitle(),
          task.getDescription(),
          task.getStatus(),
          task.getDueDate(),
          task.getUserId(),
        ]
      );
    }

    const savedTask = await this.findById(task.getId());
    if (!savedTask) {
      throw new Error('Failed to save task');
    }

    return savedTask;
  }

  async delete(id: string): Promise<void> {
    const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }
  }
}
