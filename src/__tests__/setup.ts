import dotenv from 'dotenv';
import { pool } from '../shared/config/database';
import { beforeAll, afterAll } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set default JWT_SECRET for testing if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

let isConnected = false;

beforeAll(async () => {
  // Setup test database if needed
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

afterAll(async () => {
  // Close database connection
  if (isConnected) {
    try {
      await pool.end();
    } catch (error) {
      console.error('Failed to close database connection:', error);
    }
  }
});
