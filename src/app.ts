import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
export function createApp(): Application {
  const app = express();
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'", 
          "'unsafe-inline'",
          "https://maps.googleapis.com",
          "https://*.googleapis.com"
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'", 
          "data:", 
          "https://*.googleapis.com",
          "https://*.gstatic.com",
          "https://*.google.com",
          "https://*.ggpht.com"
        ],
        connectSrc: [
          "'self'", 
          "http://localhost:*", 
          "https://localhost:*",
          "https://*.googleapis.com",
          "https://*.google.com"
        ],
        frameSrc: ["https://www.google.com"],
      },
    },
  }));
  app.use(cors({ origin: config.cors.origin }));
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      success: false,
      error: 'Too many requests. Please wait a moment before trying again.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000), // seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/health',
  });
  app.use('/api/', limiter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('public'));
  if (config.nodeEnv === 'development') {
    app.use((req, _res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }
  app.use('/api', routes);
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Drone Delivery Management API',
      version: '1.0.0',
      documentation: '/api/health',
    });
  });
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
