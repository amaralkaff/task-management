// src/infrastructure/persistence/migrations/runMigrations.ts
import { pool } from '../../../shared/config/database';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function splitSqlStatements(sql: string): string[] {
  const lines = sql.split('\n');
  let currentStatement = '';
  const statements: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('--')) {
      continue;
    }

    currentStatement += ' ' + trimmedLine;

    if (trimmedLine.endsWith(';')) {
      statements.push(currentStatement.trim());
      currentStatement = '';
    }
  }

  return statements;
}

async function runMigrations() {
  const connection = await pool.getConnection();

  try {
    // Baca file SQL dalam urutan yang benar
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_update_task_status.sql',
    ];

    let allStatements: string[] = [];

    // Baca semua file migrasi
    for (const file of migrationFiles) {
      const sql = await fs.readFile(path.join(__dirname, file), 'utf-8');

      // Split statements
      const statements = splitSqlStatements(sql);

      allStatements = [...allStatements, ...statements];
    }

    // Start transaction
    await connection.beginTransaction();

    // Jalankan setiap statement
    for (const statement of allStatements) {
      try {
        await connection.query(statement);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }

    // Commit transaction
    await connection.commit();
    console.log('All migrations completed successfully');
  } catch (error) {
    // Rollback jika ada error
    await connection.rollback();
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Release connection
    connection.release();
    process.exit(0);
  }
}

// Jalankan migrasi
console.log('Starting migrations...');
runMigrations();
