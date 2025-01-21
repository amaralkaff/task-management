import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../server';
import { pool } from '../../shared/config/database';
import { JWTAuthService } from '../../infrastructure/auth/JWTAuthService';
import { User } from '../../domain/entities/User';
import { MySQLUserRepository } from '../../infrastructure/persistence/mysql/MySQLUserRepository';
import { v4 as uuidv4 } from 'uuid';

describe('Task API Integration Tests', () => {
  let app: Express;
  let authToken: string;
  let taskId: string;
  let testUser: User;

  const authService = new JWTAuthService();
  const userRepository = new MySQLUserRepository();

  beforeAll(async () => {
    app = await createServer();

    // Create test user
    testUser = new User(
      uuidv4(),
      `test-${Date.now()}@example.com`,
      'Test User',
      'test-password',
      new Date(),
      new Date()
    );

    // Save user to database
    await userRepository.save(testUser);

    // Generate token
    authToken = authService.generateToken({
      userId: testUser.getId(),
      email: testUser.getEmail(),
    });
  });

  afterAll(async () => {
    // Clean up test data
    await pool.execute('DELETE FROM tasks WHERE user_id = ?', [
      testUser.getId(),
    ]);
    await pool.execute('DELETE FROM users WHERE id = ?', [testUser.getId()]);
  });

  describe('Create Task', () => {
    it('should create a task successfully', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            mutation CreateTask($input: CreateTaskInput!) {
              createTask(input: $input) {
                id
                title
                description
                status
                dueDate
                user {
                  id
                  email
                }
              }
            }
          `,
          variables: {
            input: {
              title: 'Integration Test Task',
              description: 'Test Description',
              status: 'pending',
              dueDate: new Date().toISOString(),
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data?.createTask).toBeDefined();
      expect(response.body.data?.createTask.title).toBe(
        'Integration Test Task'
      );
      expect(response.body.data?.createTask.user.id).toBe(testUser.getId());

      taskId = response.body.data?.createTask.id;
    });

    it('should fail to create task without authentication', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation CreateTask($input: CreateTaskInput!) {
              createTask(input: $input) {
                id
                title
              }
            }
          `,
          variables: {
            input: {
              title: 'Test Task',
              description: 'Test Description',
              status: 'pending',
              dueDate: new Date().toISOString(),
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('Get Tasks', () => {
    it('should get all tasks for user', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            query GetTasks {
              tasks {
                id
                title
                status
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.tasks).toBeDefined();
      expect(Array.isArray(response.body.data.tasks)).toBe(true);
    });

    it('should get task by id', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            query GetTask($id: ID!) {
              task(id: $id) {
                id
                title
                description
                status
                user {
                  id
                  email
                }
              }
            }
          `,
          variables: {
            id: taskId,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data?.task).toBeDefined();
      expect(response.body.data?.task.id).toBe(taskId);
      expect(response.body.data?.task.user.id).toBe(testUser.getId());
    });
  });

  describe('Update Task', () => {
    it('should update task successfully', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
              updateTask(id: $id, input: $input) {
                id
                title
                status
                user {
                  id
                  email
                }
              }
            }
          `,
          variables: {
            id: taskId,
            input: {
              title: 'Updated Task Title',
              status: 'in_progress',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data?.updateTask).toBeDefined();
      expect(response.body.data?.updateTask.title).toBe('Updated Task Title');
      expect(response.body.data?.updateTask.status).toBe('in_progress');
      expect(response.body.data?.updateTask.user.id).toBe(testUser.getId());
    });
  });

  describe('Delete Task', () => {
    it('should delete task successfully', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            mutation DeleteTask($id: ID!) {
              deleteTask(id: $id)
            }
          `,
          variables: {
            id: taskId,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data?.deleteTask).toBe(true);

      // Verify task is deleted
      const verifyResponse = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            query GetTask($id: ID!) {
              task(id: $id) {
                id
              }
            }
          `,
          variables: {
            id: taskId,
          },
        });

      expect(verifyResponse.body.errors).toBeDefined();
      expect(verifyResponse.body.errors[0].message).toContain('not found');
    });
  });
});
