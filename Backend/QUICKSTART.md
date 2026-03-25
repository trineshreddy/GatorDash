# Quick Start Guide - Running Backend Server & Testing with Postman

## Step 1: Start the Backend Server

### Option A: Run directly with Go (Recommended for development)

1. Open a terminal/command prompt
2. Navigate to the Backend directory:
   ```bash
   cd SE-PROJECT-CEN5035-\Backend
   ```
   
   Or if you're already in the project root:
   ```bash
   cd Backend
   ```

3. Run the server:
   ```bash
   go run main.go
   ```

4. You should see output like:
   ```
   Database connected and migrated successfully
   Server starting on port :8080
   API Endpoints:
     POST   /api/signup
     POST   /api/signin
     GET    /api/users
     GET    /api/user/:id
     PUT    /api/user/:id
     DELETE /api/user/:id
     GET    /health
   ```
   
   **Note:** A SQLite database file (`gatordash.db`) will be created automatically in the Backend directory.

5. **Keep this terminal window open** - the server is now running on `http://localhost:8080`

### Option B: Build and run executable

1. Navigate to Backend directory
2. Build the executable:
   ```bash
   go build -o gatordash-backend.exe
   ```
3. Run the executable:
   ```bash
   .\gatordash-backend.exe
   ```

---

## Step 2: Test with Postman

### Prerequisites
- Postman installed ([Download Postman](https://www.postman.com/downloads/))
- Backend server running (from Step 1)

---

## Step 3: Test Health Check (Optional - Verify Server is Running)

1. Open Postman
2. Create a new **GET** request
3. Enter URL: `http://localhost:8080/health`
4. Click **Send**
5. Expected Response:
   ```json
   {
     "success": true,
     "message": "Server is running"
   }
   ```

---

## Step 4: Test Sign Up API

1. Create a new **POST** request in Postman
2. Enter URL: `http://localhost:8080/api/signup`
3. Go to **Headers** tab:
   - Key: `Content-Type`
   - Value: `application/json`
4. Go to **Body** tab:
   - Select **raw**
   - Select **JSON** from dropdown
   - Enter this JSON:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "phone": "1234567890",
     "password": "password123"
   }
   ```
5. Click **Send**
6. **IMPORTANT:** Copy the `id` from the response - you'll need it for other API calls!
   - Look for: `"id": "user_1234567890"` in the response
7. Expected Response (200):
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

## Step 5: Test Sign In API

1. Create a new **POST** request
2. Enter URL: `http://localhost:8080/api/signin`
3. Go to **Headers** tab:
   - Key: `Content-Type`
   - Value: `application/json`
4. Go to **Body** tab:
   - Select **raw**
   - Select **JSON**
   - Enter this JSON:
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```
5. Click **Send**
6. Expected Response (200):
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

## Step 6: Test Get All Users API (View All Users in Database)

1. Create a new **GET** request
2. Enter URL: `http://localhost:8080/api/users`
3. Click **Send**
4. Expected Response (200):
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
   
   **This endpoint shows all users stored in the database!**

---

## Step 7: Test Get User API

1. Create a new **GET** request
2. Enter URL: `http://localhost:8080/api/user/{id}`
   - Replace `{id}` with the user ID from Step 4
   - Example: `http://localhost:8080/api/user/user_1234567890`
3. Click **Send**
4. Expected Response (200):
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

## Step 8: Test Update User API

1. Create a new **PUT** request
2. Enter URL: `http://localhost:8080/api/user/{id}`
   - Replace `{id}` with the user ID from Step 4
   - Example: `http://localhost:8080/api/user/user_1234567890`
3. Go to **Headers** tab:
   - Key: `Content-Type`
   - Value: `application/json`
4. Go to **Body** tab:
   - Select **raw**
   - Select **JSON**
   - Enter this JSON (all fields are optional):
   ```json
   {
     "name": "Jane Doe",
     "phone": "9876543210"
   }
   ```
5. Click **Send**
6. Expected Response (200):
   ```json
   {
     "success": true,
     "message": "User updated successfully",
     "data": {
       "id": "user_1234567890",
       "name": "Jane Doe",
       "email": "john@example.com",
       "phone": "9876543210",
       "created_at": "2024-01-01T12:00:00Z",
       "updated_at": "2024-01-01T12:30:00Z"
     }
   }
   ```

---

## Step 9: Test Delete User API

1. Create a new **DELETE** request
2. Enter URL: `http://localhost:8080/api/user/{id}`
   - Replace `{id}` with the user ID from Step 4
   - Example: `http://localhost:8080/api/user/user_1234567890`
3. Click **Send**
4. Expected Response (200):
   ```json
   {
     "success": true,
     "message": "User deleted successfully"
   }
   ```
5. **Verify deletion:** Try Step 6 (Get User) again - should return 404 error

---

## Postman Collection Setup (Optional but Recommended)

### Create a Postman Collection:

1. In Postman, click **New** → **Collection**
2. Name it: `GatorDash API`
3. Add these requests to the collection:

   - **Sign Up** (POST)
     - URL: `http://localhost:8080/api/signup`
     - Body: JSON with name, email, phone, password
   
   - **Sign In** (POST)
     - URL: `http://localhost:8080/api/signin`
     - Body: JSON with email, password
   
   - **Get All Users** (GET)
     - URL: `http://localhost:8080/api/users`
     - Shows all users in the database
   
   - **Get User** (GET)
     - URL: `http://localhost:8080/api/user/{{userId}}`
     - Use variable `{{userId}}` for the user ID
   
   - **Update User** (PUT)
     - URL: `http://localhost:8080/api/user/{{userId}}`
     - Body: JSON with fields to update
   
   - **Delete User** (DELETE)
     - URL: `http://localhost:8080/api/user/{{userId}}`
   
   - **Health Check** (GET)
     - URL: `http://localhost:8080/health`

### Using Variables in Postman:

1. After Sign Up, copy the `id` from response
2. In Postman, go to **Variables** tab in your collection
3. Add variable: `userId` = `user_1234567890` (your actual ID)
4. Use `{{userId}}` in URLs for Get/Update/Delete requests

---

## Troubleshooting

### Server won't start:
- Make sure Go is installed: `go version`
- Make sure you're in the Backend directory
- Run `go mod download` if dependencies are missing

### "Connection refused" in Postman:
- Make sure the server is running (check terminal)
- Verify the URL is correct: `http://localhost:8080`
- Check if port 8080 is already in use

### "404 Not Found" errors:
- Check the URL path is correct (should start with `/api/`)
- Verify the HTTP method (POST, GET, PUT, DELETE)

### "400 Bad Request" errors:
- Check JSON format in request body
- Verify all required fields are provided
- Check Content-Type header is set to `application/json`

### "401 Unauthorized" on Sign In:
- Verify email and password are correct
- Make sure user exists (try Sign Up first)

---

## Testing Flow Summary

1. ✅ Start server: `go run main.go`
2. ✅ Test Health: GET `/health`
3. ✅ Sign Up: POST `/api/signup` → **Save the user ID**
4. ✅ Sign In: POST `/api/signin`
5. ✅ Get All Users: GET `/api/users` → **View all users in database**
6. ✅ Get User: GET `/api/user/{id}`
7. ✅ Update User: PUT `/api/user/{id}`
8. ✅ Delete User: DELETE `/api/user/{id}`
9. ✅ Verify: Try Get User again → should be 404

---

## Notes

- All passwords are hashed using bcrypt
- User data is stored in **SQLite database** (`gatordash.db`) - data persists after server restarts
- Backend uses **Gin** framework and **GORM** for database operations
- All endpoints return JSON responses
- To view the database directly, see `DATABASE_GUIDE.md`
- Server runs on port 8080 by default

