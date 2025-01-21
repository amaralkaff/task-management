// src/interfaces/graphql/resolvers/TaskResolver.ts
import { TaskUseCase } from '../../../application/task/TaskUseCase';
import { Context } from '../types/context';
import { AuthenticationError } from '../../../shared/errors/AppError';
import { MySQLUserRepository } from '../../../infrastructure/persistence/mysql/MySQLUserRepository';
import { pool } from '../../../shared/config/database';
import { Task } from '../../../domain/entities/Task';
import { LocalFileStorageService } from '../../../infrastructure/storage/LocalFileStorageService';
import { RowDataPacket } from 'mysql2';

interface FileRow extends RowDataPacket {
  id: string;
  task_id: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  created_at: Date;
}

interface TaskRow extends RowDataPacket {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class TaskResolver {
  private userRepository: MySQLUserRepository;

  constructor(private taskUseCase: TaskUseCase) {
    this.userRepository = new MySQLUserRepository();
  }

  resolvers = {
    Task: {
      user: async (parent: any) => {
        return this.userRepository.findById(parent.userId);
      },
      files: async (parent: any) => {
        const [rows] = await pool.execute(
          'SELECT * FROM files WHERE task_id = ?',
          [parent.id]
        );

        if (!Array.isArray(rows)) {
          return [];
        }

        return rows.map((row: any) => ({
          id: row.id,
          filename: row.filename,
          mimetype: row.mimetype,
          size: row.size,
          createdAt: row.created_at,
        }));
      },
    },

    Query: {
      tasks: async (
        _: any,
        {
          filter,
        }: {
          filter?: {
            filterByStatus?: string;
            filterByDueDate?: Date;
            search?: string;
            sortBy?: 'TITLE' | 'DUE_DATE' | 'STATUS' | 'CREATED_AT';
            sortOrder?: 'ASC' | 'DESC';
          };
        },
        context: Context
      ) => {
        if (!context.user) {
          throw new AuthenticationError();
        }

        let query = 'SELECT * FROM tasks WHERE user_id = ?';
        const params: any[] = [context.user.id];

        if (filter?.filterByStatus) {
          query += ' AND status = ?';
          params.push(filter.filterByStatus);
        }

        if (filter?.filterByDueDate) {
          query += ' AND DATE(due_date) = DATE(?)';
          params.push(filter.filterByDueDate);
        }

        if (filter?.search) {
          query +=
            ' AND (title LIKE ? OR description LIKE ? OR status LIKE ? OR DATE_FORMAT(due_date, "%Y-%m-%d") LIKE ?)';
          const searchTerm = `%${filter.search}%`;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Logika pengurutan yang baru
        let orderBy = '';
        if (filter?.sortBy) {
          const sortOrder = filter.sortOrder || 'ASC';
          switch (filter.sortBy) {
            case 'TITLE':
              orderBy = `title ${sortOrder}`;
              break;
            case 'DUE_DATE':
              orderBy = `due_date ${sortOrder} NULLS LAST`;
              break;
            case 'STATUS':
              orderBy = `CASE status 
                WHEN 'pending' THEN 1 
                WHEN 'in_progress' THEN 2 
                WHEN 'completed' THEN 3 
                END ${sortOrder}`;
              break;
            case 'CREATED_AT':
              orderBy = `created_at ${sortOrder}`;
              break;
            default:
              orderBy = 'created_at DESC';
          }
        } else {
          // Default pengurutan
          orderBy = 'created_at DESC';
        }

        query += ` ORDER BY ${orderBy}`;

        const [rows] = await pool.execute(query, params);

        if (!Array.isArray(rows)) {
          return [];
        }

        return rows.map(
          (row: any) =>
            new Task(
              row.id,
              row.title,
              row.description,
              row.status,
              row.due_date,
              row.user_id,
              row.created_at,
              row.updated_at
            )
        );
      },

      task: async (_: any, { id }: { id: string }, context: Context) => {
        if (!context.user) {
          throw new AuthenticationError();
        }
        return this.taskUseCase.getTask(id);
      },
    },

    Mutation: {
      createTask: async (
        _: any,
        { input }: { input: any },
        context: Context
      ) => {
        if (!context.user) {
          throw new AuthenticationError();
        }

        return this.taskUseCase.createTask(
          context.user.id,
          input.title,
          input.description,
          input.status,
          input.dueDate
        );
      },

      updateTask: async (
        _: any,
        { id, input }: { id: string; input: any },
        context: Context
      ) => {
        if (!context.user) {
          throw new AuthenticationError();
        }

        return this.taskUseCase.updateTask(id, context.user.id, input);
      },

      deleteTask: async (_: any, { id }: { id: string }, context: Context) => {
        if (!context.user) {
          throw new AuthenticationError();
        }

        await this.taskUseCase.deleteTask(id, context.user.id);
        return true;
      },

      deleteFile: async (_: any, { id }: { id: string }, context: Context) => {
        if (!context.user) {
          throw new AuthenticationError();
        }

        // Get file info
        const [fileRows] = await pool.execute<FileRow[]>(
          'SELECT * FROM files WHERE id = ?',
          [id]
        );

        if (!Array.isArray(fileRows) || fileRows.length === 0) {
          throw new Error('File not found');
        }

        const file = fileRows[0];

        // Get task info to verify ownership
        const [taskRows] = await pool.execute<TaskRow[]>(
          'SELECT * FROM tasks WHERE id = ?',
          [file.task_id]
        );

        if (!Array.isArray(taskRows) || taskRows.length === 0) {
          throw new Error('Task not found');
        }

        const task = taskRows[0];

        if (task.user_id !== context.user.id) {
          throw new AuthenticationError(
            'You can only delete files from your own tasks'
          );
        }

        // Delete file from storage
        const fileStorageService = new LocalFileStorageService();
        await fileStorageService.delete(file.path);

        // Delete file record from database
        await pool.execute('DELETE FROM files WHERE id = ?', [id]);

        return true;
      },
    },
  };
}
