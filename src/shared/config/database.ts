// src/shared/config/database.ts
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test koneksi hanya jika bukan di environment testing
if (process.env.NODE_ENV !== 'test') {
  pool
    .getConnection()
    .then((connection) => {
      console.log('✅ Database terhubung');
      connection.release();
    })
    .catch((err) => {
      console.error('❌ Gagal terhubung ke database:', err.message);
      // Jangan exit process di environment development
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
}
