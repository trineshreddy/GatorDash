# Complete Setup Guide - GatorDash Backend

## Tech Stack
- **Backend Framework:** Gin (Go)
- **ORM:** GORM
- **Database:** PostgreSQL
- **Language:** Go 1.21+

---

## Step 1: Install Prerequisites

### 1.1 Install Go
1. Download Go from: https://golang.org/dl/
2. Install Go (version 1.21 or higher)
3. Verify installation:
   ```bash
   go version
   ```

### 1.2 Install PostgreSQL

#### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Remember the password you set for the `postgres` user
   - Default port is `5432`
   - Keep default settings
4. PostgreSQL will install as a Windows service

#### macOS:
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 1.3 Verify PostgreSQL Installation
```bash
# Windows (in Command Prompt or PowerShell)
psql --version

# macOS/Linux
psql --version
```

---

## Step 2: Setup PostgreSQL Database

### 2.1 Create Database

#### Option A: Using psql Command Line
1. Open terminal/command prompt
2. Connect to PostgreSQL:
   ```bash
   # Windows
   psql -U postgres
   
   # macOS/Linux (if needed, use sudo)
   sudo -u postgres psql
   ```
3. Enter your PostgreSQL password when prompted
4. Create the database:
   ```sql
   CREATE DATABASE gatordash;
   ```
5. Verify database creation:
   ```sql
   \l
   ```
   You should see `gatordash` in the list
6. Exit psql:
   ```sql
   \q
   ```

#### Option B: Using pgAdmin (GUI Tool)
1. Open pgAdmin (installed with PostgreSQL)
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `gatordash`
5. Click "Save"

### 2.2 Test Database Connection
```bash
# Connect to the new database
psql -U postgres -d gatordash

# You should see:
# gatordash=#
```

---

## Step 3: Setup Backend Project

### 3.1 Navigate to Backend Directory
```bash
cd SE-PROJECT-CEN5035-\Backend
```

### 3.2 Install Go Dependencies
```bash
go mod download
```

This will install:
- Gin framework
- GORM
- PostgreSQL driver
- Bcrypt for password hashing

### 3.3 Configure Database Connection

Create a `.env` file in the Backend directory:

**Windows (PowerShell):**
```powershell
# Create .env file
@"
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=gatordash
DB_PORT=5432
DB_SSLMODE=disable
"@ | Out-File -FilePath .env -Encoding utf8
```

**macOS/Linux:**
```bash
cat > .env << EOF
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=gatordash
DB_PORT=5432
DB_SSLMODE=disable
EOF
```

**Or manually create `.env` file:**
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=gatordash
DB_PORT=5432
DB_SSLMODE=disable
```

**Important:** Replace `your_postgres_password` with your actual PostgreSQL password!

### 3.4 Install godotenv (for loading .env file)

The current code uses `os.Getenv()` which reads from system environment variables. For `.env` file support, we need to add godotenv:

```bash
go get github.com/joho/godotenv
```

Then update `database/database.go` to load the .env file (see updated code below).

---

## Step 4: Run the Backend Server

### 4.1 Start the Server
```bash
go run main.go
```

You should see:
```
PostgreSQL database connected and migrated successfully
Server starting on port :8080
API Endpoints:
  POST   /api/signup
  POST   /api/signin
  GET    /api/users
  GET    /api/user/:id
  PUT    /api/user/:id
  DELETE /api/user/:id
  GET    /health
[GIN-debug] Listening and serving HTTP on :8080
```

**If you see database connection errors:**
- Check your `.env` file has correct credentials
- Verify PostgreSQL is running
- Verify database `gatordash` exists
- Check firewall settings

---

## Step 5: Test with Postman

### 5.1 Test Health Check
- **Method:** GET
- **URL:** `http://localhost:8080/health`
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Server is running"
  }
  ```

### 5.2 Test Sign Up
- **Method:** POST
- **URL:** `http://localhost:8080/api/signup`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "password123"
  }
  ```
- **Save the `id` from response** for other API calls

### 5.3 Test Sign In
- **Method:** POST
- **URL:** `http://localhost:8080/api/signin`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### 5.4 Test Get All Users
- **Method:** GET
- **URL:** `http://localhost:8080/api/users`
- **This shows all users in the database!**

### 5.5 Test Get User by ID
- **Method:** GET
- **URL:** `http://localhost:8080/api/user/{id}`
- Replace `{id}` with the user ID from signup

### 5.6 Test Update User
- **Method:** PUT
- **URL:** `http://localhost:8080/api/user/{id}`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "Jane Doe",
    "phone": "9876543210"
  }
  ```

### 5.7 Test Delete User
- **Method:** DELETE
- **URL:** `http://localhost:8080/api/user/{id}`

---

## Step 6: View Data in PostgreSQL

### Option 1: Using psql
```bash
psql -U postgres -d gatordash

# View all users
SELECT * FROM users;

# View users without password
SELECT id, name, email, phone, created_at, updated_at FROM users;

# Count users
SELECT COUNT(*) FROM users;

# Exit
\q
```

### Option 2: Using pgAdmin
1. Open pgAdmin
2. Navigate to: Servers → PostgreSQL → Databases → gatordash → Schemas → public → Tables → users
3. Right-click on `users` → View/Edit Data → All Rows

### Option 3: Using API
- **GET** `http://localhost:8080/api/users` - Shows all users in JSON format

---

## Troubleshooting

### Database Connection Failed

**Error:** `failed to connect to database`

**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   # Windows
   services.msc (look for PostgreSQL service)
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Verify database exists:
   ```bash
   psql -U postgres -l
   ```

3. Check `.env` file credentials are correct

4. Test connection manually:
   ```bash
   psql -U postgres -d gatordash -h localhost
   ```

### Port Already in Use

**Error:** `bind: address already in use`

**Solution:**
- Change port in `main.go` or stop the process using port 8080
- Or use a different port: `router.Run(":8081")`

### Module Not Found

**Error:** `cannot find module`

**Solution:**
```bash
go mod tidy
go mod download
```

### Migration Errors

**Error:** `failed to migrate database`

**Solution:**
- Check database user has CREATE TABLE permissions
- Verify database name is correct
- Check PostgreSQL logs for detailed errors

---

## Project Structure

```
Backend/
├── main.go                 # Application entry point
├── go.mod                  # Go dependencies
├── go.sum                  # Dependency checksums
├── .env                    # Database configuration (create this)
├── .env.example            # Example environment file
├── database/
│   └── database.go         # PostgreSQL connection & migration
├── models/
│   └── user.go             # User model with GORM tags
├── store/
│   └── user_store.go       # Database operations (CRUD)
├── handlers/
│   └── user_handler.go    # Gin HTTP handlers
├── routes/
│   └── routes.go           # Gin router setup
└── utils/
    └── response.go         # Response helpers
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_NAME` | Database name | `gatordash` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_SSLMODE` | SSL mode | `disable` |

---

## Next Steps

1. ✅ Database setup complete
2. ✅ Backend server running
3. ✅ APIs tested with Postman
4. 🔄 Ready for frontend integration (Sprint 2)

---

## Quick Commands Reference

```bash
# Start PostgreSQL (if not running as service)
# Windows: Start service from services.msc
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql

# Connect to database
psql -U postgres -d gatordash

# Run backend server
go run main.go

# Install dependencies
go mod download

# Clean and rebuild
go mod tidy
go build
```

