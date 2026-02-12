import { createApp } from './app';
import { config } from './config';
import { droneService } from './services/droneService';
import { connectDatabase, disconnectDatabase } from './db/connection';
async function initializeSampleData() {
  console.log('Initializing sample data...');
  const drone1 = await droneService.createDrone({ latitude: 37.7749, longitude: -122.4194 }); // San Francisco
  const drone2 = await droneService.createDrone({ latitude: 34.0522, longitude: -118.2437 }); // Los Angeles
  const drone3 = await droneService.createDrone({ latitude: 40.7128, longitude: -74.006 }); // New York
  console.log(`Created ${3} sample drones:`);
  console.log(`  - ${drone1.id}`);
  console.log(`  - ${drone2.id}`);
  console.log(`  - ${drone3.id}`);
}
async function startServer() {
  try {
    await connectDatabase();
    const app = createApp();
    if (config.nodeEnv === 'development') {
      await initializeSampleData();
    }
    const server = app.listen(config.port, () => {
      console.log('=================================');
      console.log('Drone Delivery Management System');
      console.log('=================================');
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Server running on port ${config.port}`);
      console.log(`API URL: http://localhost:${config.port}/api`);
      console.log(`Health Check: http://localhost:${config.port}/api/health`);
      console.log('=================================');
    });
    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(async () => {
        console.log('Server closed');
        await disconnectDatabase();
        process.exit(0);
      });
    };
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
startServer();
