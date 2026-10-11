# Daystar Forms Portal Backend

Express.js + TypeScript backend API for the Daystar Christian Centre Forms Portal, built with MongoDB.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Form Management**: CRUD operations for naming/dedication and courtship forms
- **Church Zones**: Management of church zones and leadership
- **Notifications**: Email notification system for form updates
- **Validation**: Input validation using Zod schemas
- **Security**: Helmet, CORS, and other security middleware
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: Helmet, bcryptjs

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- pnpm (preferred) or npm

## Setup & Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/daystar_forms
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:3000
   ```

3. **Database Setup**
   
   Start MongoDB and seed the database:
   ```bash
   # Seed database with sample data
   pnpm run seed
   ```

## Development

```bash
# Start development server with hot reload
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)
- `PUT /api/auth/change-password` - Change password (authenticated)
- `POST /api/auth/refresh` - Refresh JWT token (authenticated)

### Naming & Dedication Forms (`/api/forms/naming-dedication`)
- `POST /api/forms/naming-dedication` - Create new form (authenticated)
- `GET /api/forms/naming-dedication` - Get all forms (authenticated, filtered by user role)
- `GET /api/forms/naming-dedication/:id` - Get single form (authenticated)
- `PUT /api/forms/naming-dedication/:id` - Update form (authenticated, owner/admin only)
- `PATCH /api/forms/naming-dedication/:id/status` - Update form status (admin only)
- `DELETE /api/forms/naming-dedication/:id` - Delete form (authenticated, owner/admin only)
- `GET /api/forms/naming-dedication/statistics/overview` - Get statistics (admin only)

### Courtship Forms (`/api/forms/courtship`)
- `POST /api/forms/courtship` - Create new form (authenticated)
- `GET /api/forms/courtship` - Get all forms (authenticated, filtered by user role)
- `GET /api/forms/courtship/:id` - Get single form (authenticated)
- `PUT /api/forms/courtship/:id` - Update form (authenticated, owner/admin only)
- `PATCH /api/forms/courtship/:id/status` - Update form status (admin only)
- `DELETE /api/forms/courtship/:id` - Delete form (authenticated, owner/admin only)
- `GET /api/forms/courtship/statistics/overview` - Get statistics (admin only)

### Church Zones (`/api/church-zones`)
- `GET /api/church-zones` - Get all church zones (public)
- `GET /api/church-zones/:id` - Get single church zone (public)
- `POST /api/church-zones` - Create new church zone (admin only)
- `PUT /api/church-zones/:id` - Update church zone (admin only)
- `DELETE /api/church-zones/:id` - Delete church zone (admin only)

### Notifications (`/api/notifications`)
- `POST /api/notifications` - Create notification (admin only)
- `GET /api/notifications` - Get all notifications (admin only)
- `GET /api/notifications/:id` - Get single notification (admin only)
- `PATCH /api/notifications/:id/status` - Update notification status (admin only)
- `POST /api/notifications/send-pending` - Send pending notifications (admin only)
- `DELETE /api/notifications/:id` - Delete notification (admin only)
- `GET /api/notifications/statistics/overview` - Get statistics (admin only)

### Health Check
- `GET /health` - API health check

## Sample Users

After running the seed script, you can use these test accounts:

**Admin User:**
- Email: `admin@daystar.org`
- Password: `password123`

**Regular Member:**
- Email: `member@daystar.org`
- Password: `password123`

**Leader:**
- Email: `leader@daystar.org`
- Password: `password123`

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": ["Detailed validation errors if applicable"]
}
```

## Pagination

List endpoints support pagination with query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort by
- `sortOrder`: 'asc' or 'desc' (default: 'desc')

Example: `GET /api/forms/naming-dedication?page=1&limit=20&sortBy=createdAt&sortOrder=desc`

## Validation

All endpoints use Zod schemas for request validation. Invalid requests return 400 status with detailed error messages.

## Development Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build TypeScript to JavaScript
- `pnpm run start` - Start production server
- `pnpm run seed` - Seed database with sample data
- `pnpm run clean` - Clean build directory

## Project Structure

```
src/
├── middleware/          # Express middleware
├── models/             # Mongoose models
├── routes/             # API route handlers
├── scripts/            # Database scripts
├── types/              # TypeScript types and Zod schemas
├── utils/              # Utility functions
└── server.ts           # Main application file
```

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add proper validation using Zod schemas
4. Include error handling for all routes
5. Test endpoints with proper authentication