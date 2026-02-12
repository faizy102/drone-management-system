import request from 'supertest';
import { createApp } from '../src/app';
import { Application } from 'express';
describe('Authentication API', () => {
  let app: Application;
  beforeAll(() => {
    app = createApp();
  });
  describe('POST /api/auth/login', () => {
    it('should generate token for valid admin user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        name: 'admin-user',
        type: 'admin',
      });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.type).toBe('admin');
      expect(response.body.data.name).toBe('admin-user');
    });
    it('should generate token for valid enduser', async () => {
      const response = await request(app).post('/api/auth/login').send({
        name: 'john-doe',
        type: 'enduser',
      });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.type).toBe('enduser');
    });
    it('should generate token for valid drone', async () => {
      const response = await request(app).post('/api/auth/login').send({
        name: 'drone_abc123',
        type: 'drone',
      });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.type).toBe('drone');
    });
    it('should reject invalid user type', async () => {
      const response = await request(app).post('/api/auth/login').send({
        name: 'test-user',
        type: 'invalid-type',
      });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    it('should reject missing name', async () => {
      const response = await request(app).post('/api/auth/login').send({
        type: 'admin',
      });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    it('should reject missing type', async () => {
      const response = await request(app).post('/api/auth/login').send({
        name: 'test-user',
      });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
