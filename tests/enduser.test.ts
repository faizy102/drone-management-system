import request from 'supertest';
import { createApp } from '../src/app';
import { Application } from 'express';
describe('Enduser API', () => {
  let app: Application;
  let enduserToken: string;
  const enduserName = 'john-doe';
  beforeAll(() => {
    app = createApp();
  });
  beforeEach(async () => {
    const authResponse = await request(app).post('/api/auth/login').send({
      name: enduserName,
      type: 'enduser',
    });
    enduserToken = authResponse.body.data.token;
  });
  describe('POST /api/enduser/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      };
      const response = await request(app)
        .post('/api/enduser/orders')
        .set('Authorization', `Bearer ${enduserToken}`)
        .send(orderData);
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.enduserName).toBe(enduserName);
      expect(response.body.data.origin).toEqual(orderData.origin);
      expect(response.body.data.destination).toEqual(orderData.destination);
    });
    it('should reject invalid coordinates', async () => {
      const response = await request(app)
        .post('/api/enduser/orders')
        .set('Authorization', `Bearer ${enduserToken}`)
        .send({
          origin: { latitude: 200, longitude: -122.4194 },
          destination: { latitude: 37.7849, longitude: -122.4094 },
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/enduser/orders')
        .send({
          origin: { latitude: 37.7749, longitude: -122.4194 },
          destination: { latitude: 37.7849, longitude: -122.4094 },
        });
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  describe('GET /api/enduser/orders', () => {
    it('should get all orders for the enduser', async () => {
      await request(app)
        .post('/api/enduser/orders')
        .set('Authorization', `Bearer ${enduserToken}`)
        .send({
          origin: { latitude: 37.7749, longitude: -122.4194 },
          destination: { latitude: 37.7849, longitude: -122.4094 },
        });
      await request(app)
        .post('/api/enduser/orders')
        .set('Authorization', `Bearer ${enduserToken}`)
        .send({
          origin: { latitude: 38.0, longitude: -122.0 },
          destination: { latitude: 38.1, longitude: -122.1 },
        });
      const response = await request(app)
        .get('/api/enduser/orders')
        .set('Authorization', `Bearer ${enduserToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });
  });
  describe('GET /api/enduser/orders/:orderId', () => {
    it('should get specific order details', async () => {
      const createResponse = await request(app)
        .post('/api/enduser/orders')
        .set('Authorization', `Bearer ${enduserToken}`)
        .send({
          origin: { latitude: 37.7749, longitude: -122.4194 },
          destination: { latitude: 37.7849, longitude: -122.4094 },
        });
      const orderId = createResponse.body.data.id;
      const response = await request(app)
        .get(`/api/enduser/orders/${orderId}`)
        .set('Authorization', `Bearer ${enduserToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
    });
    it('should not access other users orders', async () => {
      const otherUserAuth = await request(app).post('/api/auth/login').send({
        name: 'other-user',
        type: 'enduser',
      });
      const createResponse = await request(app)
        .post('/api/enduser/orders')
        .set('Authorization', `Bearer ${otherUserAuth.body.data.token}`)
        .send({
          origin: { latitude: 37.7749, longitude: -122.4194 },
          destination: { latitude: 37.7849, longitude: -122.4094 },
        });
      const orderId = createResponse.body.data.id;
      const response = await request(app)
        .get(`/api/enduser/orders/${orderId}`)
        .set('Authorization', `Bearer ${enduserToken}`);
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
  describe('DELETE /api/enduser/orders/:orderId', () => {
    it('should withdraw a pending order', async () => {
      const createResponse = await request(app)
        .post('/api/enduser/orders')
        .set('Authorization', `Bearer ${enduserToken}`)
        .send({
          origin: { latitude: 37.7749, longitude: -122.4194 },
          destination: { latitude: 37.7849, longitude: -122.4094 },
        });
      const orderId = createResponse.body.data.id;
      const response = await request(app)
        .delete(`/api/enduser/orders/${orderId}`)
        .set('Authorization', `Bearer ${enduserToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('withdrawn');
    });
    it('should not withdraw other users orders', async () => {
      const otherUserAuth = await request(app).post('/api/auth/login').send({
        name: 'other-user',
        type: 'enduser',
      });
      const createResponse = await request(app)
        .post('/api/enduser/orders')
        .set('Authorization', `Bearer ${otherUserAuth.body.data.token}`)
        .send({
          origin: { latitude: 37.7749, longitude: -122.4194 },
          destination: { latitude: 37.7849, longitude: -122.4094 },
        });
      const orderId = createResponse.body.data.id;
      const response = await request(app)
        .delete(`/api/enduser/orders/${orderId}`)
        .set('Authorization', `Bearer ${enduserToken}`);
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
