# GatorDash Frontend-Backend Integration Guide

This document aligns frontend and backend developers on:
- local setup
- API contracts
- integration workflow
- common error handling
- release handoff checklist

Use this as the source of truth while connecting React UI with Go APIs.

---

## 1) System Overview

- **Frontend:** React app in `frontend`
- **Backend:** Go + Gin API in `Backend`
- **Database:** PostgreSQL (`gatordash`)
- **Current backend base URL:** `http://localhost:8080`

Main API groups:
- User APIs: signup/signin/profile CRUD
- Food APIs: food stalls + stall menu
- Cart APIs: add/view/remove/clear cart

---

## 2) Local Environment Setup

### 2.1 Backend setup

1. Go to backend:
   ```bash
   cd Backend
   ```
2. Ensure `.env` exists at project root (already added):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=gatordash
   DB_SSLMODE=disable
   ```
3. Start backend:
   ```bash
   go run main.go
   ```
4. Verify:
   - `GET http://localhost:8080/health` returns success

### 2.2 Frontend setup

1. Go to frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```
2. Frontend runs on `http://localhost:3000`

### 2.3 Important proxy alignment

Current `frontend/package.json` has:
- `"proxy": "http://localhost:5000"`

Backend runs on `8080`, so update proxy to:
- `"proxy": "http://localhost:8080"`

This allows frontend to call relative routes like `/api/signup` without CORS issues in dev.

---

## 3) API Contract (Backend Source of Truth)

All responses follow:
```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

For errors:
```json
{
  "success": false,
  "message": "error description"
}
```

### 3.1 Health

- `GET /health`

### 3.2 User APIs

- `POST /api/signup`
  - body: `{ name, email, phone, password }`
- `POST /api/signin`
  - body: `{ email, password }`
- `GET /api/users`
- `GET /api/user/:id`
- `PUT /api/user/:id`
  - body (partial): `{ name?, email?, phone?, password? }`
- `DELETE /api/user/:id`

### 3.3 Food APIs

- `GET /api/foodstalls`
- `GET /api/foodstalls/:id/menu`

### 3.4 Cart APIs

- `POST /api/cart/add`
  - body: `{ user_id, menu_item_id, quantity }`
- `GET /api/cart/:user_id`
- `DELETE /api/cart/:user_id/item/:menu_item_id`
- `DELETE /api/cart/:user_id/clear`

---

## 4) Frontend Integration Plan by Screen

### 4.1 SignUp screen (`SignUp.js`)

Current status:
- form validates locally
- does not call backend yet

Integrate with:
- `POST /api/signup`

On success:
- show success toast
- redirect to `/signin`

On failure:
- show backend `message` in toast/error banner

### 4.2 SignIn screen (`SignIn.js`)

Current status:
- calls `onSignIn(email, password)` only

Integrate with:
- `POST /api/signin`

On success:
- store user object (`id`, `name`, `email`, `phone`) in app state/localStorage
- navigate to food stalls page

On failure:
- show "Invalid email or password" from API response

### 4.3 Food Stalls screen (`FoodStalls.js`)

Current status:
- uses hardcoded `stalls` array

Integrate with:
- `GET /api/foodstalls`

Replace local array with API response data.

### 4.4 Menu screen (new or existing)

Integrate with:
- `GET /api/foodstalls/:id/menu`

Display:
- item name
- description
- price
- availability

### 4.5 Cart actions

Integrate with:
- Add item: `POST /api/cart/add`
- View cart: `GET /api/cart/:user_id`
- Remove item: `DELETE /api/cart/:user_id/item/:menu_item_id`
- Clear cart: `DELETE /api/cart/:user_id/clear`

---

## 5) Recommended Frontend API Layer

Create a shared API client file (for example `frontend/src/api/client.js`) and centralize:
- base URL
- JSON headers
- error parsing

Recommended pattern:
- one file per module:
  - `api/auth.js`
  - `api/food.js`
  - `api/cart.js`

Benefits:
- one source for endpoint paths
- consistent error handling
- easy future JWT integration

---

## 6) Shared Data Contracts

### 6.1 User object (from signup/signin/get)

```json
{
  "id": "user_...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### 6.2 Food stall

```json
{
  "id": "stall_1",
  "name": "Gator Bites",
  "description": "Burgers, fries, and quick bites",
  "is_active": true
}
```

### 6.3 Menu item

```json
{
  "id": "menu_...",
  "food_stall_id": "stall_1",
  "name": "Classic Burger",
  "description": "Beef patty with cheese",
  "price": 9.99,
  "is_available": true
}
```

### 6.4 Cart item response

```json
{
  "id": "cart_...",
  "user_id": "user_...",
  "menu_item_id": "menu_...",
  "item_name": "Classic Burger",
  "price": 9.99,
  "quantity": 2,
  "subtotal": 19.98
}
```

---

## 7) Error Handling Agreement

Frontend should:
- always check `success`
- display `message` to user for known errors
- show generic fallback for network/server failures

Expected backend status usage:
- `200` success
- `400` invalid input
- `401` invalid signin
- `404` not found
- `409` duplicate user/email
- `500` server/database failure

---

## 8) End-to-End Verification Flow

Run this flow before merging integration changes:

1. Signup user
2. Signin with same user
3. Fetch food stalls
4. Open one stall menu
5. Add item to cart
6. View cart
7. Remove one item
8. Add again and clear cart

Cross-check DB tables:
- `users`
- `foodstalls`
- `menu`
- `cart`

---

## 9) Team Handoff Checklist

### Backend dev checklist

- [ ] APIs return stable JSON contract (`success`, `message`, `data`)
- [ ] Seed data exists for `foodstalls` and `menu`
- [ ] Unit tests pass (`go test ./...`)
- [ ] Endpoint and field names are communicated before changes

### Frontend dev checklist

- [ ] `proxy` points to `http://localhost:8080` in dev
- [ ] No hardcoded stalls/menu in production flow
- [ ] All API failures show user-friendly message
- [ ] `userId` is available for cart APIs after signin
- [ ] Manual E2E flow passes

---

## 10) Known Gaps / Next Sprint Recommendations

- Add JWT authentication and middleware
- Add ownership checks on cart endpoints
- Add pagination/filtering for stalls/menu
- Add dedicated `/api/cart/:user_id/summary` endpoint for totals
- Add integration tests in CI pipeline

---

## 11) Quick Command Reference

Backend:
```bash
cd Backend
go run main.go
go test ./...
```

Frontend:
```bash
cd frontend
npm install
npm start
```

