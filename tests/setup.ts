import { connectDatabase, disconnectDatabase, clearDatabase } from '../src/db/connection';
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'memory'; // Use in-memory MongoDB for tests
beforeAll(async () => {
  await connectDatabase();
}, 180000); // Timeout: 180 seconds for MongoDB binary download
afterAll(async () => {
  await disconnectDatabase();
});
beforeEach(async () => {
  await clearDatabase();
});
