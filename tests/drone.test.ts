import request from 'supertest';
import { createApp } from '../src/app';
import { droneService } from '../src/services/droneService';
import { orderService } from '../src/services/orderService';
import { Application } from 'express';
describe('Drone API', () => {
  let app: Application;
  let droneToken: string;
  let droneId: string;
  beforeAll(() => {
    app = createApp();
  });
  beforeEach(async () => {
    const drone = await droneService.createDrone({ latitude: 37.7749, longitude: -122.4194 });
    droneId = drone.id;
    const authResponse = await request(app).post('/api/auth/login').send({
      name: droneId,
      type: 'drone',
    });
    droneToken = authResponse.body.data.token;
  });
  describe('POST /api/drone/reserve', () => {
    it('should reserve a pending job', async () => {
      await orderService.createOrder('test-user', {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      });
      const response = await request(app)
        .post('/api/drone/reserve')
        .set('Authorization', `Bearer ${droneToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('reserved');
      expect(response.body.data.assignedDroneId).toBe(droneId);
    });
    it('should fail when no pending orders', async () => {
      const response = await request(app)
        .post('/api/drone/reserve')
        .set('Authorization', `Bearer ${droneToken}`);
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
    it('should fail without authentication', async () => {
      const response = await request(app).post('/api/drone/reserve');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  describe('POST /api/drone/grab', () => {
    it('should pick up a reserved order', async () => {
      await orderService.createOrder('test-user', {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      });
      await request(app).post('/api/drone/reserve').set('Authorization', `Bearer ${droneToken}`);
      const response = await request(app)
        .post('/api/drone/grab')
        .set('Authorization', `Bearer ${droneToken}`)
        .send({ fromLocation: 'origin' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_transit');
    });
  });
  describe('PUT /api/drone/location', () => {
    it('should update drone location', async () => {
      const newLocation = { latitude: 37.8, longitude: -122.5 };
      const response = await request(app)
        .put('/api/drone/location')
        .set('Authorization', `Bearer ${droneToken}`)
        .send(newLocation);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.location).toEqual(newLocation);
    });
    it('should reject invalid coordinates', async () => {
      const response = await request(app)
        .put('/api/drone/location')
        .set('Authorization', `Bearer ${droneToken}`)
        .send({ latitude: 200, longitude: -122.5 });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  describe('PUT /api/drone/order/status', () => {
    it('should mark order as delivered', async () => {
      await orderService.createOrder('test-user', {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      });
      await request(app).post('/api/drone/reserve').set('Authorization', `Bearer ${droneToken}`);
      await request(app).post('/api/drone/grab').set('Authorization', `Bearer ${droneToken}`);
      const response = await request(app)
        .put('/api/drone/order/status')
        .set('Authorization', `Bearer ${droneToken}`)
        .send({ status: 'delivered' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('delivered');
    });
    it('should mark order as failed', async () => {
      await orderService.createOrder('test-user', {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      });
      await request(app).post('/api/drone/reserve').set('Authorization', `Bearer ${droneToken}`);
      await request(app).post('/api/drone/grab').set('Authorization', `Bearer ${droneToken}`);
      const response = await request(app)
        .put('/api/drone/order/status')
        .set('Authorization', `Bearer ${droneToken}`)
        .send({ status: 'failed' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('failed');
    });
  });
  describe('POST /api/drone/broken', () => {
    it('should mark drone as broken and create handoff order', async () => {
      await orderService.createOrder('test-user', {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      });
      await request(app).post('/api/drone/reserve').set('Authorization', `Bearer ${droneToken}`);
      await request(app).post('/api/drone/grab').set('Authorization', `Bearer ${droneToken}`);
      const response = await request(app)
        .post('/api/drone/broken')
        .set('Authorization', `Bearer ${droneToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.drone.status).toBe('broken');
      expect(response.body.data.handoffOrder).toBeTruthy();
    });
  });
  describe('GET /api/drone/order', () => {
    it('should get current order details', async () => {
      await orderService.createOrder('test-user', {
        origin: { latitude: 37.7749, longitude: -122.4194 },
        destination: { latitude: 37.7849, longitude: -122.4094 },
      });
      await request(app).post('/api/drone/reserve').set('Authorization', `Bearer ${droneToken}`);
      const response = await request(app)
        .get('/api/drone/order')
        .set('Authorization', `Bearer ${droneToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });
    it('should return 404 when no current order', async () => {
      const response = await request(app)
        .get('/api/drone/order')
        .set('Authorization', `Bearer ${droneToken}`);
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
