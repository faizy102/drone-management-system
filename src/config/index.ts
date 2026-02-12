import dotenv from 'dotenv';
dotenv.config();
export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiration: process.env.JWT_EXPIRATION || '24h',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '500', 10), // 500 requests/min for development (increased)
  },
  mongoUri: process.env.MONGODB_URI || 'memory',
  droneHeartbeatTimeout: 5 * 60 * 1000,
  droneSpeedKmPerHour: 50,
};
