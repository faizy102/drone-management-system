import request from 'supertest';
import { createApp } from '../src/app';
import { droneService } from '../src/services/droneService';
import { orderService } from '../src/services/orderService';
import { db } from '../src/models/database';
import { Application } from 'express';
describe('Admin API', () => {
  let app: Application;
  let adminToken: string;
  beforeAll(() => {
    app = createApp();
  });
  beforeEach(async () => {
    const authResponse = await request(app).post('/api/auth/login').send({
      name: 'admin',
      type: 'admin',
    });
    adminToken = authResponse.body.data.token;
  });
  describe('GET /api/admin/orders', () => {
    it('should get all orders in bulk', async () => {
      await orderService.createOrder('user1', {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      });
      await orderService.createOrder('user2', {
        origin: { latitude: 38.0, longitude: -122.0 },
        destination: { latitude: 38.1, longitude: -122.1 },
      });
      const response = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });
    it('should fail without admin authentication', async () => {
      const enduserAuth = await request(app).post('/api/auth/login').send({
        name: 'regular-user',
        type: 'enduser',
      });
      const response = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${enduserAuth.body.data.token}`);
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
  describe('GET /api/admin/orders/:orderId', () => {
    it('should get any order details', async () => {
      const order = await orderService.createOrder('some-user', {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      });
      const response = await request(app)
        .get(`/api/admin/orders/${order.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(order.id);
    });
  });
  describe('PUT /api/admin/orders/:orderId/location', () => {
    it('should update order origin', async () => {
      const order = await orderService.createOrder('user1', {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      });
      const newOrigin = { latitude: 38.0, longitude: -123.0 };
      const response = await request(app)
        .put(`/api/admin/orders/${order.id}/location`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ origin: newOrigin });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.origin).toEqual(newOrigin);
    });
    it('should update order destination', async () => {
      const order = await orderService.createOrder('user1', {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      });
      const newDestination = { latitude: 39.0, longitude: -121.0 };
      const response = await request(app)
        .put(`/api/admin/orders/${order.id}/location`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ destination: newDestination });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.destination).toEqual(newDestination);
    });
    it('should not update non-pending orders', async () => {
      const order = await orderService.createOrder('user1', {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      });
      await db.updateOrder(order.id, { status: 'reserved' as any });
      const response = await request(app)
        .put(`/api/admin/orders/${order.id}/location`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ origin: { latitude: 38.0, longitude: -123.0 } });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  describe('GET /api/admin/drones', () => {
    it('should get list of all drones', async () => {
      await droneService.createDrone({ latitude: 37.7749, longitude: -122.4194 });
      await droneService.createDrone({ latitude: 38.0, longitude: -122.0 });
      await droneService.createDrone({ latitude: 39.0, longitude: -121.0 });
      const response = await request(app)
        .get('/api/admin/drones')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.count).toBe(3);
    });
  });
  describe('PUT /api/admin/drones/:droneId/status', () => {
    it('should mark drone as broken', async () => {
      const drone = await droneService.createDrone({ latitude: 37.7749, longitude: -122.4194 });
      const response = await request(app)
        .put(`/api/admin/drones/${drone.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'broken' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.drone.status).toBe('broken');
    });
    it('should mark drone as fixed', async () => {
      const drone = await droneService.createDrone({ latitude: 37.7749, longitude: -122.4194 });
      await droneService.markAsBroken(drone.id);
      const response = await request(app)
        .put(`/api/admin/drones/${drone.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'fixed' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.drone.status).toBe('idle');
    });
    it('should reject invalid status', async () => {
      const drone = await droneService.createDrone({ latitude: 37.7749, longitude: -122.4194 });
      const response = await request(app)
        .put(`/api/admin/drones/${drone.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
