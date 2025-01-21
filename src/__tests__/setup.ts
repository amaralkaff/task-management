// src/__tests__/setup.ts
import dotenv from 'dotenv';
import { pool } from '../shared/config/database';
import { beforeAll, afterAll } from '@jest/globals';

process.env.NODE_ENV = 'test';

dotenv.config({ path: '.env.test' });

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

let isConnected = false;

// setup test database
beforeAll(async () => {
  if (!isConnected) {
    try {
      await pool.getConnection();
      isConnected = true;
    } catch (error) {
      console.error('Failed to connect to test database:', error);
      throw error;
    }
  }
});

// close database connection
afterAll(async () => {
  if (isConnected) {
    try {
      await pool.end();
    } catch (error) {
      console.error('Failed to close database connection:', error);
    }
  }
});
