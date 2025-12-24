# Hotel Booking API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Health Check
- **GET** `/health` - Health check endpoint

### Authentication (`/api/auth`)
- **POST** `/api/auth/register` - Register new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }
  ```
- **POST** `/api/auth/login` - User login
  ```json
  {
    "email": "admin@example.com",
    "password": "Admin123!"
  }
  ```

### Users (`/api/users`)
- **GET** `/api/users/profile` - Get current user profile
- **PUT** `/api/users/profile` - Update current user profile
  ```json
  {
    "name": "John Updated",
    "phone": "+1234567890"
  }
  ```
- **PUT** `/api/users/change-password` - Change password
  ```json
  {
    "currentPassword": "oldPassword",
    "newPassword": "newPassword123"
  }
  ```
- **GET** `/api/users?page=1&limit=10` - Get all users (Admin only)
- **PUT** `/api/users/:id/deactivate` - Deactivate user (Admin only)

### Roles (`/api/roles`)
- **GET** `/api/roles?page=1&limit=10` - Get all roles
- **GET** `/api/roles/:id` - Get role by ID
- **POST** `/api/roles` - Create role (Admin only)
  ```json
  {
    "name": "MANAGER"
  }
  ```
- **PUT** `/api/roles/:id` - Update role (Admin only)
  ```json
  {
    "name": "SENIOR_MANAGER"
  }
  ```
- **DELETE** `/api/roles/:id` - Delete role (Admin only)

### Sessions (`/api/sessions`)
- **GET** `/api/sessions/my-sessions?page=1&limit=10` - Get current user's sessions
- **DELETE** `/api/sessions/my-sessions` - Delete all current user's sessions
- **GET** `/api/sessions/:id` - Get session by ID (Admin only)
- **POST** `/api/sessions` - Create session (Admin only)
  ```json
  {
    "user_id": 1,
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "expires_at": "2024-12-31T23:59:59Z"
  }
  ```
- **PUT** `/api/sessions/:id` - Update session (Admin only)
- **DELETE** `/api/sessions/:id` - Delete session (Admin only)
- **DELETE** `/api/sessions/cleanup/expired` - Delete expired sessions (Admin only)

### Addresses (`/api/addresses`)
- **GET** `/api/addresses/my-addresses?page=1&limit=10` - Get current user's addresses
- **POST** `/api/addresses/my-addresses` - Create address
  ```json
  {
    "country_id": 1,
    "state_id": 1,
    "city_id": 1,
    "line1": "123 Main Street",
    "zipcode": "10001"
  }
  ```
- **PUT** `/api/addresses/my-addresses/:id` - Update address
  ```json
  {
    "line1": "456 Updated Street",
    "zipcode": "10002"
  }
  ```
- **DELETE** `/api/addresses/my-addresses/:id` - Delete address
- **GET** `/api/addresses?page=1&limit=10` - Get all addresses (Admin only)
- **GET** `/api/addresses/:id` - Get address by ID (Admin only)

## Response Format

### Success Response
```json
{
  "data": {...},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing with Postman

1. Import the `postman-collection.json` file into Postman
2. Set the `baseUrl` variable to `http://localhost:3001`
3. Start with the authentication endpoints to get a token
4. The token will be automatically stored and used for subsequent requests

## Default Admin Credentials
```
Email: admin@example.com
Password: Admin123!
```

## Database Setup
Make sure to run the seed script to populate the database with initial data:
```bash
npm run prisma:seed
```
