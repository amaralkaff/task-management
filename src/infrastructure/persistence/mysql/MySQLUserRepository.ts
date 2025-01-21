// src/infrastructure/persistence/mysql/MySQLUserRepository.ts
import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { pool } from '../../../shared/config/database';

export class MySQLUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return new User(
      row.id,
      row.email,
      row.name,
      row.password,
      row.created_at,
      row.updated_at
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return new User(
      row.id,
      row.email,
      row.name,
      row.password,
      row.created_at,
      row.updated_at
    );
  }

  async save(user: User): Promise<User> {
    const existingUser = await this.findById(user.getId());

    if (existingUser) {
      // Update
      await pool.execute(
        'UPDATE users SET email = ?, name = ?, password = ? WHERE id = ?',
        [user.getEmail(), user.getName(), user.getPassword(), user.getId()]
      );
    } else {
      // Insert
      await pool.execute(
        'INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)',
        [user.getId(), user.getEmail(), user.getName(), user.getPassword()]
      );
    }

    const savedUser = await this.findById(user.getId());
    if (!savedUser) {
      throw new Error('Failed to save user');
    }

    return savedUser;
  }
}
