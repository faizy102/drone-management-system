import mongoose from 'mongoose';
import { config } from '../config';
let isConnected = false;
export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    console.log('📦 Already connected to database');
    return;
  }
  try {
    const mongoUri = config.mongoUri;
    if (mongoUri === 'memory') {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('📦 Connected to in-memory MongoDB');
    } else {
      await mongoose.connect(mongoUri);
      console.log('📦 Connected to MongoDB:', mongoUri.replace(/\/\/.*@/, '//<credentials>@'));
    }
    isConnected = true;
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      isConnected = false;
    });
    mongoose.connection.on('disconnected', () => {
      console.log('📦 MongoDB disconnected');
      isConnected = false;
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}
export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }
  await mongoose.disconnect();
  isConnected = false;
  console.log('📦 Disconnected from MongoDB');
}
export async function clearDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  console.log('🗑️  Database cleared');
}
