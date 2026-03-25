# GatorDash Backend API

A complete Go backend for the GatorDash food ordering platform using **Gin**, **GORM**, and **PostgreSQL**.

## Tech Stack

- **Framework:** Gin (Go web framework)
- **ORM:** GORM
- **Database:** PostgreSQL
- **Language:** Go 1.21+

## Project Structure

The backend is organized into a modular structure for scalability:

```
Backend/
├── main.go                 # Application entry point
├── go.mod                  # Go module dependencies
├── go.sum                  # Dependency checksums
├── .env                    # Database configuration (create this)
├── database/
│   └── database.go         # PostgreSQL connection & migration
├── models/
│   └── user.go             # User model with GORM tags
├── store/
│   └── user_store.go       # Database operations (CRUD)
├── handlers/
│   └── user_handler.go     # Gin HTTP handlers
├── routes/
│   └── routes.go           # Gin router setup
└── utils/
    └── response.go          # Response helpers
```

## Prerequisites

- Go 1.21 or higher
- PostgreSQL 12+ installed and running
- Postman (for testing APIs)

## Quick Start

### 1. Install Dependencies

```bash
cd Backend
go mod download
```

### 2. Setup PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gatordash;
\q
```

### 3. Configure Database Connection

Create a `.env` file in the Backend directory:

```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=gatordash
DB_PORT=5432
DB_SSLMODE=disable
```

**Replace `your_postgres_password` with your actual PostgreSQL password!**

### 4. Run the Server

```bash
go run main.go
```

The server will start on `http://localhost:8080`

## API Endpoints

### 1. Sign Up (POST)
**Endpoint:** `POST /api/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

---

### 2. Sign In (POST)
**Endpoint:** `POST /api/signin`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "id": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

---

### 3. Get All Users (GET)
**Endpoint:** `GET /api/users`

**Description:** Retrieve all users from the database

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user_1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

---

### 4. Get User (GET)
**Endpoint:** `GET /api/user/:id`

**URL Parameters:**
- `id` - User ID (e.g., `user_1234567890`)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

---

### 5. Update User (PUT)
**Endpoint:** `PUT /api/user/:id`

**URL Parameters:**
- `id` - User ID

**Request Body (all fields optional):**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "password": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user_1234567890",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:30:00Z"
  }
}
```

---

### 6. Delete User (DELETE)
**Endpoint:** `DELETE /api/user/:id`

**URL Parameters:**
- `id` - User ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 7. Health Check (GET)
**Endpoint:** `GET /health`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Server is running"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_NAME` | Database name | `gatordash` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_SSLMODE` | SSL mode | `disable` |

## Testing with Postman

See `QUICKSTART.md` for detailed Postman testing instructions.

## Viewing Database

See `DATABASE_GUIDE.md` for instructions on viewing users in PostgreSQL.

## Documentation

- **SETUP_GUIDE.md** - Complete setup instructions
- **QUICKSTART.md** - Quick start and Postman testing guide
- **DATABASE_GUIDE.md** - PostgreSQL database viewing guide

## Features

- ✅ User registration (Sign Up)
- ✅ User authentication (Sign In)
- ✅ Get all users
- ✅ Get user by ID
- ✅ Update user information
- ✅ Delete user account
- ✅ Password hashing with bcrypt
- ✅ PostgreSQL database with GORM
- ✅ Auto-migration of database schema
- ✅ Environment variable configuration
- ✅ RESTful API design
- ✅ JSON request/response format
- ✅ Error handling with appropriate HTTP status codes

## Error Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid credentials)
- `404` - Not Found (user doesn't exist)
- `409` - Conflict (email already exists)
- `500` - Internal Server Error

## Notes

- All passwords are hashed using bcrypt
- User data is stored in PostgreSQL database - data persists after server restarts
- Backend uses **Gin** framework and **GORM** for database operations
- All endpoints return JSON responses
- Database schema is automatically created/updated on server start

## Development

### Run in development mode:
```bash
go run main.go
```

### Build executable:
```bash
go build -o gatordash-backend.exe
```

### Install dependencies:
```bash
go mod download
go mod tidy
```

## License

This project is part of the GatorDash food ordering platform.
