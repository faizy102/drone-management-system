# Deployment Guide

This guide covers deploying the Drone Delivery Management System to production.

## Prerequisites

- Node.js v16+ installed on the server
- Process manager (PM2 recommended)
- Reverse proxy (Nginx recommended)
- SSL certificate for HTTPS

## Environment Setup

### 1. Production Environment Variables

Create a `.env` file in production with secure values:

```env
NODE_ENV=production
PORT=3000

# Strong JWT secret (use a secure random string)
JWT_SECRET=your-production-secret-key-min-32-characters
JWT_EXPIRATION=24h

# CORS configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Build the Application

```bash
npm run build
```

This creates a `dist/` directory with compiled JavaScript.

## Deployment Options

### Option 1: PM2 (Recommended)

PM2 is a production process manager for Node.js applications.

#### Install PM2

```bash
npm install -g pm2
```

#### Start the Application

```bash
pm2 start dist/server.js --name drone-api
```

#### Configure PM2 for Auto-Restart

```bash
pm2 startup
pm2 save
```

#### Useful PM2 Commands

```bash
# View logs
pm2 logs drone-api

# Restart
pm2 restart drone-api

# Stop
pm2 stop drone-api

# Monitor
pm2 monit

# View status
pm2 status
```

### Option 2: Docker

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

#### Create .dockerignore

```
node_modules
npm-debug.log
.env
.git
.gitignore
dist
coverage
tests
```

#### Build and Run

```bash
# Build image
docker build -t drone-delivery-api .

# Run container
docker run -d \
  --name drone-api \
  -p 3000:3000 \
  --env-file .env \
  drone-delivery-api
```

### Option 3: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run with:
```bash
docker-compose up -d
```

## Nginx Reverse Proxy

### Install Nginx

```bash
sudo apt-get update
sudo apt-get install nginx
```

### Configure Nginx

Create `/etc/nginx/sites-available/drone-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/drone-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL with Let's Encrypt

### Install Certbot

```bash
sudo apt-get install certbot python3-certbot-nginx
```

### Get SSL Certificate

```bash
sudo certbot --nginx -d api.yourdomain.com
```

### Auto-Renewal

Certbot automatically sets up renewal. Test it with:
```bash
sudo certbot renew --dry-run
```

## Monitoring and Logging

### PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Application Logs

Configure Winston for production logging:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Security Checklist

- [ ] Use HTTPS only
- [ ] Set strong JWT_SECRET
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Implement request logging
- [ ] Set up firewall rules
- [ ] Regular security audits (`npm audit`)
- [ ] Use helmet.js (already configured)

## Health Checks

The API provides a health check endpoint:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "success": true,
  "message": "Drone Delivery Management API is running",
  "timestamp": "2026-02-10T10:00:00.000Z"
}
```

## Scaling

### Horizontal Scaling with PM2 Cluster Mode

```bash
pm2 start dist/server.js -i max --name drone-api
```

This starts one instance per CPU core.

### Load Balancing with Nginx

```nginx
upstream drone_api {
    least_conn;
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    location / {
        proxy_pass http://drone_api;
    }
}
```

## Backup and Recovery

### Database Backup (when using real DB)

For PostgreSQL:
```bash
pg_dump drone_delivery > backup.sql
```

For MongoDB:
```bash
mongodump --db drone_delivery --out /backup
```

### Application State

The current implementation uses in-memory storage. For production, integrate with:
- PostgreSQL
- MongoDB
- Redis (for caching)

## Performance Optimization

1. **Enable Compression**
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Cache Static Assets**
   Configure Nginx caching for static content

3. **Database Indexing**
   When using a real database, index frequently queried fields

4. **Connection Pooling**
   Use connection pooling for database connections

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs drone-api

# Check Node.js version
node --version

# Verify build
npm run build
```

### High Memory Usage

```bash
# Monitor memory
pm2 monit

# Restart application
pm2 restart drone-api
```

### Database Connection Issues

Check:
- Database is running
- Credentials are correct
- Network connectivity
- Firewall rules

## CI/CD Pipeline

### Example GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        run: |
          # Add deployment commands here
```

## Support

For issues or questions:
- Check logs: `pm2 logs drone-api`
- Review error messages
- Verify environment variables
- Check API health endpoint
