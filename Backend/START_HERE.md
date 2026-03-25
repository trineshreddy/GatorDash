# 🚀 START HERE - Complete Backend Setup

## Quick Setup (5 Steps)

### Step 1: Install PostgreSQL
- **Windows:** Download from https://www.postgresql.org/download/windows/
- **macOS:** `brew install postgresql@15`
- **Linux:** `sudo apt install postgresql`

### Step 2: Create Database
```bash
psql -U postgres
CREATE DATABASE gatordash;
\q
```

### Step 3: Create .env File
Create `.env` file in Backend directory:
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=gatordash
DB_PORT=5432
DB_SSLMODE=disable
```

### Step 4: Install Dependencies
```bash
cd Backend
go mod download
```

### Step 5: Run Server
```bash
go run main.go
```

Server runs on: `http://localhost:8080`

---

## 📚 Documentation Files

1. **SETUP_GUIDE.md** - Complete step-by-step setup instructions
2. **QUICKSTART.md** - Quick start and Postman testing
3. **DATABASE_GUIDE.md** - How to view data in PostgreSQL
4. **README.md** - API documentation

---

## 🧪 Test APIs

### Using Postman:

1. **Health Check:** `GET http://localhost:8080/health`
2. **Sign Up:** `POST http://localhost:8080/api/signup`
3. **Sign In:** `POST http://localhost:8080/api/signin`
4. **Get All Users:** `GET http://localhost:8080/api/users` ⭐
5. **Get User:** `GET http://localhost:8080/api/user/:id`
6. **Update User:** `PUT http://localhost:8080/api/user/:id`
7. **Delete User:** `DELETE http://localhost:8080/api/user/:id`

---

## 🔍 View Database

### Option 1: API (Easiest)
```
GET http://localhost:8080/api/users
```

### Option 2: PostgreSQL Command Line
```bash
psql -U postgres -d gatordash
SELECT * FROM users;
\q
```

### Option 3: pgAdmin (GUI)
- Open pgAdmin
- Navigate to: Databases → gatordash → Tables → users
- Right-click → View/Edit Data

---

## ✅ Tech Stack

- ✅ **Gin** - Go web framework
- ✅ **GORM** - ORM for database operations
- ✅ **PostgreSQL** - Relational database
- ✅ **Bcrypt** - Password hashing

---

## 🆘 Troubleshooting

**Database connection failed?**
- Check PostgreSQL is running
- Verify `.env` file has correct password
- Ensure database `gatordash` exists

**Module not found?**
```bash
go mod tidy
go mod download
```

**Port already in use?**
- Change port in `main.go` or stop other process

---

## 📖 Next Steps

1. ✅ Complete setup
2. ✅ Test APIs with Postman
3. ✅ View users in database
4. 🔄 Ready for frontend integration!

---

**For detailed instructions, see SETUP_GUIDE.md**

