# PostgreSQL Database Guide - Viewing All Users

The backend uses **PostgreSQL** database for persistent storage. All users are stored in the `users` table in the `gatordash` database.

## Database Configuration

The database connection is configured via environment variables (`.env` file):

```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=gatordash
DB_PORT=5432
DB_SSLMODE=disable
```

## Viewing the Database

### Option 1: Using psql (Command Line) - Recommended

1. **Connect to the database:**
   ```bash
   psql -U postgres -d gatordash
   ```
   Enter your PostgreSQL password when prompted.

2. **View all users:**
   ```sql
   SELECT * FROM users;
   ```

3. **View users without password:**
   ```sql
   SELECT id, name, email, phone, created_at, updated_at FROM users;
   ```

4. **Count total users:**
   ```sql
   SELECT COUNT(*) FROM users;
   ```

5. **Find user by email:**
   ```sql
   SELECT * FROM users WHERE email = 'john@example.com';
   ```

6. **View users sorted by creation date:**
   ```sql
   SELECT id, name, email, created_at FROM users ORDER BY created_at DESC;
   ```

7. **Exit psql:**
   ```sql
   \q
   ```

### Option 2: Using pgAdmin (GUI Tool)

1. **Open pgAdmin** (installed with PostgreSQL)

2. **Connect to PostgreSQL server:**
   - Enter your PostgreSQL password
   - Server should be listed in the left panel

3. **Navigate to the database:**
   - Servers → PostgreSQL → Databases → **gatordash** → Schemas → public → Tables → **users**

4. **View data:**
   - Right-click on `users` table
   - Select "View/Edit Data" → "All Rows"
   - You'll see all users in a table format

5. **Run SQL queries:**
   - Click on "Tools" → "Query Tool"
   - Enter SQL queries and click "Execute"

### Option 3: Using API Endpoint (Easiest)

Use the **GET /api/users** endpoint in Postman to view all users:

1. **Create a GET request in Postman**
2. **URL:** `http://localhost:8080/api/users`
3. **Click Send**
4. **Response will show all users:**
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
       },
       {
         "id": "user_1234567891",
         "name": "Jane Smith",
         "email": "jane@example.com",
         "phone": "9876543210",
         "created_at": "2024-01-01T13:00:00Z",
         "updated_at": "2024-01-01T13:00:00Z"
       }
     ]
   }
   ```

## Database Schema

The `users` table has the following structure:

| Column     | Type      | Constraints              | Description                    |
|------------|-----------|-------------------------|--------------------------------|
| id         | VARCHAR   | PRIMARY KEY             | User ID (e.g., "user_123")     |
| name       | VARCHAR   | NOT NULL                | User's full name               |
| email      | VARCHAR   | UNIQUE, NOT NULL        | User's email                   |
| phone      | VARCHAR   | NOT NULL               | User's phone number           |
| password   | VARCHAR   | NOT NULL                | Hashed password (bcrypt)       |
| created_at | TIMESTAMP | NOT NULL                | Account creation timestamp     |
| updated_at | TIMESTAMP | NOT NULL                | Last update timestamp          |

## Useful SQL Queries

### View all users (without password):
```sql
SELECT id, name, email, phone, created_at, updated_at FROM users;
```

### Count total users:
```sql
SELECT COUNT(*) as total_users FROM users;
```

### Find user by email:
```sql
SELECT * FROM users WHERE email = 'john@example.com';
```

### Find users created today:
```sql
SELECT * FROM users WHERE DATE(created_at) = CURRENT_DATE;
```

### View users sorted by creation date (newest first):
```sql
SELECT id, name, email, created_at FROM users ORDER BY created_at DESC;
```

### View users sorted by name:
```sql
SELECT id, name, email FROM users ORDER BY name ASC;
```

### Search users by name:
```sql
SELECT * FROM users WHERE name ILIKE '%john%';
```

### Get user statistics:
```sql
SELECT 
    COUNT(*) as total_users,
    COUNT(DISTINCT email) as unique_emails,
    MIN(created_at) as first_user,
    MAX(created_at) as latest_user
FROM users;
```

## Database Management

### Create Database (if not exists):
```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE gatordash;

-- Grant permissions (if needed)
GRANT ALL PRIVILEGES ON DATABASE gatordash TO postgres;

-- Exit
\q
```

### Drop and Recreate Database (⚠️ WARNING: Deletes all data):
```sql
-- Connect as postgres user
psql -U postgres

-- Drop database
DROP DATABASE gatordash;

-- Create new database
CREATE DATABASE gatordash;

-- Exit
\q
```

### Backup Database:
```bash
# Create backup
pg_dump -U postgres -d gatordash > gatordash_backup.sql

# Restore from backup
psql -U postgres -d gatordash < gatordash_backup.sql
```

## Important Notes

1. **Password Security:** Passwords are hashed using bcrypt and stored in the database. Never expose passwords in queries or logs.

2. **Database Persistence:** The database persists all data even after the server stops. All data is saved automatically.

3. **Auto-Migration:** The database schema is automatically created/updated when you start the server using GORM's AutoMigrate feature.

4. **Connection:** The backend connects to PostgreSQL using the credentials in your `.env` file.

5. **Database Location:** PostgreSQL stores data in its data directory (typically `/var/lib/postgresql` on Linux, or in the PostgreSQL installation directory on Windows).

## Troubleshooting

### Can't connect to database:
- Verify PostgreSQL is running:
  ```bash
  # Windows: Check services.msc
  # macOS: brew services list
  # Linux: sudo systemctl status postgresql
  ```
- Check `.env` file has correct credentials
- Verify database `gatordash` exists
- Test connection manually: `psql -U postgres -d gatordash`

### Permission denied:
- Make sure the database user has proper permissions
- Check PostgreSQL `pg_hba.conf` file for authentication settings

### Table doesn't exist:
- The table is created automatically on first server start
- If missing, restart the server (GORM will create it)
- Or manually run: The server's AutoMigrate will handle this

### Connection timeout:
- Check firewall settings
- Verify PostgreSQL is listening on the correct port (default: 5432)
- Check PostgreSQL logs for connection attempts

## Quick Reference

```bash
# Connect to database
psql -U postgres -d gatordash

# List all databases
psql -U postgres -l

# List all tables in current database
\dt

# Describe users table structure
\d users

# View all users
SELECT * FROM users;

# Exit psql
\q
```
