import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../server';
import { pool } from '../../shared/config/database';

describe('Auth API Integration Tests', () => {
  let app: Express;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    app = await createServer();
  });

  afterAll(async () => {
    // Clean up test data
    await pool.execute('DELETE FROM users WHERE email = ?', [testEmail]);
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                token
                user {
                  id
                  email
                  name
                }
              }
            }
          `,
          variables: {
            input: {
              email: testEmail,
              password: testPassword,
              name: 'Test User',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data?.register).toBeDefined();
      expect(response.body.data?.register.token).toBeDefined();
      expect(response.body.data?.register.user.email).toBe(testEmail);
      expect(response.body.data?.register.user.name).toBe('Test User');
    });

    it('should fail to register with existing email', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                token
                user {
                  id
                  email
                }
              }
            }
          `,
          variables: {
            input: {
              email: testEmail,
              password: testPassword,
              name: 'Test User',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Email already registered');
    });

    it('should fail to register with invalid email format', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                token
                user {
                  id
                  email
                }
              }
            }
          `,
          variables: {
            input: {
              email: 'invalid-email',
              password: testPassword,
              name: 'Test User',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Invalid');
    });
  });

  describe('User Login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                token
                user {
                  id
                  email
                  name
                }
              }
            }
          `,
          variables: {
            input: {
              email: testEmail,
              password: testPassword,
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data?.login).toBeDefined();
      expect(response.body.data?.login.token).toBeDefined();
      expect(response.body.data?.login.user.email).toBe(testEmail);
    });

    it('should fail to login with incorrect password', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                token
                user {
                  id
                  email
                }
              }
            }
          `,
          variables: {
            input: {
              email: testEmail,
              password: 'wrongpassword',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Invalid email or password');
    });

    it('should fail to login with non-existent email', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                token
                user {
                  id
                  email
                }
              }
            }
          `,
          variables: {
            input: {
              email: 'nonexistent@example.com',
              password: testPassword,
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Invalid email or password');
    });
  });
});
