# Drone Delivery Management System

A professional, production-ready drone delivery management backend built with Node.js, TypeScript, and Express. This system provides comprehensive REST APIs for managing drone deliveries with JWT authentication, real-time tracking, and Google Maps visualization.

## Quick Start Links

- **[QUICK_START.md](QUICK_START.md)** - Start here! Fixed rate limits + tracking options
- **Simple Tracking:** `http://localhost:3000/simple-tracking.html` (No Google Maps needed)
- **Maps Tracking:** `http://localhost:3000/tracking.html` (Requires API key)
- **Test Maps API:** `http://localhost:3000/test-maps.html` (Verify API key)
- **[FLOW_DIAGRAMS.md](FLOW_DIAGRAMS.md)** - Complete system architecture diagrams

## Features

- **JWT Authentication**: Self-signed JWT tokens with bearer authentication
- **Role-Based Access**: Three user types (admin, enduser, drone) with specific permissions
- **Complete Drone Lifecycle**: Reserve, pick up, deliver, and handle failures
- **Order Management**: Submit, track, and withdraw orders
- **Real-time Tracking**: Location updates with ETA calculations (5-second auto-refresh)
- **Google Maps Integration**: Live map visualization with route tracking (optional)
- **Broken Drone Handling**: Automatic handoff order creation
- **Production-Ready**: Security headers, rate limiting (200 req/min), CORS, error handling
- **MongoDB Atlas**: Cloud database with automatic collection management
- **Comprehensive Tests**: Full test coverage with Jest
- **TypeScript**: Type-safe code with strict TypeScript configuration
- **Multiple UIs**: API testing, simple tracking, and full map tracking interfaces

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Architecture](#architecture)
- [License](#license)

## Quick Start

Get up and running in 3 steps:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open your browser
# Navigate to http://localhost:3000
```

The system comes with:
- ✅ Pre-configured sample drones ready to work
- ✅ Interactive web UI for testing
- ✅ Complete REST API documentation
- ✅ Comprehensive test suite

## 🔧 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd drone_management_system
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h
```

## ⚙️ Configuration

Key configuration options in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRATION` | Token expiration time | 24h |
| `CORS_ORIGIN` | Allowed CORS origin | * |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

This starts the server with hot-reload using nodemon.

### Production Mode

```bash
npm run build
npm start
```

### Accessing the Application

Once running, you can access:

- **Web UI**: `http://localhost:3000` - Interactive testing interface
- **API Base**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/api/health`

#### Using the Web UI

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a username and select a user type (Admin, EndUser, or Drone)
3. Click "Get JWT Token" to authenticate
4. Use the tabs (Drone, EndUser, Admin) to perform various operations
5. View API responses in real-time on the right panel

The web interface provides an easy way to test all API endpoints without using curl or Postman!

## 📚 API Documentation

### Authentication

All endpoints (except login) require JWT authentication via Bearer token.

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "name": "user-name",
  "type": "admin|enduser|drone"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "admin",
    "name": "user-name"
  },
  "message": "Authentication successful"
}
```

### Drone Endpoints

All drone endpoints require `type: "drone"` authentication.

#### Reserve a Job
```http
POST /api/drone/reserve
Authorization: Bearer <token>
```

#### Grab (Pick Up) Order
```http
POST /api/drone/grab
Authorization: Bearer <token>

{
  "fromLocation": "origin|broken_drone"
}
```

#### Update Location (Heartbeat)
```http
PUT /api/drone/location
Authorization: Bearer <token>

{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

#### Mark Order Status
```http
PUT /api/drone/order/status
Authorization: Bearer <token>

{
  "status": "delivered|failed"
}
```

#### Mark Drone as Broken
```http
POST /api/drone/broken
Authorization: Bearer <token>
```

#### Get Current Order
```http
GET /api/drone/order
Authorization: Bearer <token>
```

### Enduser Endpoints

All enduser endpoints require `type: "enduser"` authentication.

#### Submit Order
```http
POST /api/enduser/orders
Authorization: Bearer <token>

{
  "origin": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "destination": {
    "latitude": 37.7849,
    "longitude": -122.4094
  }
}
```

#### Get My Orders
```http
GET /api/enduser/orders
Authorization: Bearer <token>
```

#### Get Order Details
```http
GET /api/enduser/orders/:orderId
Authorization: Bearer <token>
```

#### Withdraw Order
```http
DELETE /api/enduser/orders/:orderId
Authorization: Bearer <token>
```

### Admin Endpoints

All admin endpoints require `type: "admin"` authentication.

#### Get All Orders
```http
GET /api/admin/orders
Authorization: Bearer <token>
```

#### Get Order Details
```http
GET /api/admin/orders/:orderId
Authorization: Bearer <token>
```

#### Update Order Location
```http
PUT /api/admin/orders/:orderId/location
Authorization: Bearer <token>

{
  "origin": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "destination": {
    "latitude": 37.7849,
    "longitude": -122.4094
  }
}
```

#### Get All Drones
```http
GET /api/admin/drones
Authorization: Bearer <token>
```

#### Update Drone Status
```http
PUT /api/admin/drones/:droneId/status
Authorization: Bearer <token>

{
  "status": "broken|fixed"
}
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Test Coverage

The project includes comprehensive test coverage:

- ✅ Authentication tests
- ✅ Drone endpoint tests
- ✅ Enduser endpoint tests
- ✅ Admin endpoint tests
- ✅ Utility function tests
- ✅ Integration tests

Coverage report is generated in the `coverage/` directory.

## 🏗️ Architecture

### Project Structure

```
drone_management_system/
├── src/
│   ├── config/          # Configuration management
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware (auth, validation, errors)
│   ├── models/          # Data models and database layer
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── tests/               # Test files
├── package.json
├── tsconfig.json
└── README.md
```

### Design Patterns

- **Layered Architecture**: Controllers → Services → Models
- **Separation of Concerns**: Each layer has distinct responsibilities
- **Dependency Injection**: Services are injected where needed
- **Middleware Pattern**: Authentication, validation, error handling
- **Repository Pattern**: Database abstraction layer

### Order Status Lifecycle

```
PENDING → RESERVED → PICKED_UP → IN_TRANSIT → DELIVERED
                                              → FAILED
         ↓
      WITHDRAWN
```

### Drone Status Lifecycle

```
IDLE → RESERVED → IN_TRANSIT → IDLE
                             → BROKEN → IDLE (fixed by admin)
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-Origin Resource Sharing configuration
- **Rate Limiting**: Prevent abuse
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error messages

## 📊 Example Usage Flow

### Complete Delivery Flow

1. **Enduser submits order**:
```bash
curl -X POST http://localhost:3000/api/enduser/orders \
  -H "Authorization: Bearer <enduser-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"latitude": 37.7749, "longitude": -122.4194},
    "destination": {"latitude": 37.7849, "longitude": -122.4094}
  }'
```

2. **Drone reserves the job**:
```bash
curl -X POST http://localhost:3000/api/drone/reserve \
  -H "Authorization: Bearer <drone-token>"
```

3. **Drone picks up the order**:
```bash
curl -X POST http://localhost:3000/api/drone/grab \
  -H "Authorization: Bearer <drone-token>"
```

4. **Drone updates location (heartbeat)**:
```bash
curl -X PUT http://localhost:3000/api/drone/location \
  -H "Authorization: Bearer <drone-token>" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 37.78, "longitude": -122.42}'
```

5. **Drone marks as delivered**:
```bash
curl -X PUT http://localhost:3000/api/drone/order/status \
  -H "Authorization: Bearer <drone-token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'
```

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] WebSocket support for real-time updates
- [ ] GraphQL API
- [ ] gRPC endpoints
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] API documentation with Swagger/OpenAPI
- [ ] Monitoring and logging (Winston, Morgan)
- [ ] Message queue integration (RabbitMQ, Kafka)

## License

MIT

## Author

Backend Engineering Technical Assessment

---

**Note**: This is a demonstration project for a technical assessment. In production, ensure proper database setup, environment variable management, and security hardening.
#   D r o n e _ m a n a g e m e n t _ s y s t e m 
 
 
