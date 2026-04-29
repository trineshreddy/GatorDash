# GatorDash Backend API Testing Guide (5 New APIs)

This guide helps you test and verify these newly added APIs:

1. `GET /api/menu-items`
2. `GET /api/menu-items/by-name`
3. `PUT /api/cart/:user_id/item/:menu_item_id`
4. `POST /api/forgot-password`
5. `POST /api/reset-password`

You will verify each API in:
- Postman response
- PostgreSQL (`psql` or pgAdmin)
- Backend server logs

---

## 1) Prerequisites

1. PostgreSQL is running.
2. `.env` exists at project root and has valid DB values.
3. Start backend:

```bash
cd Backend
go run main.go
```

4. Base URL:
- `http://localhost:8080`

### Quick DB table check

```sql
\c gatordash
\dt
```

You should see at least:
- `users`
- `foodstalls`
- `menu`
- `cart`
- `password_resets`

---

## 2) Postman Environment Setup

Create these variables in Postman:
- `baseUrl = http://localhost:8080`
- `userId =` (empty)
- `menuItemId =` (empty)
- `resetToken =` (empty)
- `testEmail = api5test@example.com`

Use `{{baseUrl}}` in request URLs.

---

## 3) Initial Seed Data and User Setup (One-Time for This Guide)

### 3.1 Get one menu item ID (for cart quantity update test)

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/menu-items`

In response, copy one menu item's `id` and set Postman variable `menuItemId`.

### 3.2 Create test user (if not already created)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/signup`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "name": "API Five Test",
  "email": "{{testEmail}}",
  "phone": "1112223333",
  "password": "password123"
}
```

Copy `data.id` into `userId`.

### 3.3 Add cart item once (required before quantity update)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/cart/add`
- **Body:**

```json
{
  "user_id": "{{userId}}",
  "menu_item_id": "{{menuItemId}}",
  "quantity": 1
}
```

---

## 4) API #1 - Get All Menu Items

### Request
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/menu-items`

### Expected API Result
- Status: `200 OK`
- `success = true`
- `data` is an array of menu objects.
- Each object should contain fields like:
  - `id`
  - `food_stall_id`
  - `name`
  - `price`
  - `is_available`

### Verify in PostgreSQL

```sql
SELECT id, food_stall_id, name, price, is_available
FROM menu
ORDER BY food_stall_id, name;
```

Expected: row count should match API `data` length.

### Verify in Backend Logs
- You should see a request log similar to:
  - `GET /api/menu-items | 200`

---

## 5) API #2 - Get Menu Item By Name

### Request
- **Method:** `GET`
- **URL Example:** `{{baseUrl}}/api/menu-items/by-name?name=Item 1.1`

### Expected API Result
- Status: `200 OK`
- `success = true`
- `data` contains matching item(s) (case-insensitive exact name match).

### Verify in PostgreSQL

```sql
SELECT id, food_stall_id, name, price
FROM menu
WHERE LOWER(name) = LOWER('Item 1.1')
ORDER BY food_stall_id, name;
```

Expected: same set of rows as API response.

### Negative Tests
1. Missing query param:
   - `GET {{baseUrl}}/api/menu-items/by-name`
   - Expect: `400`
2. Unknown name:
   - `GET {{baseUrl}}/api/menu-items/by-name?name=DoesNotExistXYZ`
   - Expect: `404`

### Verify in Backend Logs
- `GET /api/menu-items/by-name?... | 200/400/404`

---

## 6) API #3 - Update Cart Item Quantity

### Request
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/cart/{{userId}}/item/{{menuItemId}}`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "quantity": 5
}
```

### Expected API Result
- Status: `200 OK`
- Message indicates cart quantity updated.

### Verify in PostgreSQL

```sql
SELECT user_id, menu_item_id, quantity, updated_at
FROM cart
WHERE user_id = '{{userId}}'
  AND menu_item_id = '{{menuItemId}}';
```

Expected: `quantity = 5`.

### Negative Tests
1. `quantity = 0` or negative -> expect `400`
2. invalid `userId` -> expect `404`
3. valid user but item not in cart -> expect `404`

### Verify in Backend Logs
- `PUT /api/cart/<user>/item/<item> | 200/400/404`

---

## 7) API #4 - Forgot Password

### Request
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/forgot-password`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "email": "{{testEmail}}"
}
```

### Expected API Result
- Status: `200 OK`
- Response contains:
  - `data.reset_token`
  - `data.expires_at`

Copy `reset_token` into Postman variable `resetToken`.

### Verify in PostgreSQL

```sql
SELECT pr.id, pr.user_id, pr.token, pr.expires_at, u.email
FROM password_resets pr
JOIN users u ON u.id = pr.user_id
WHERE u.email = '{{testEmail}}'
ORDER BY pr.created_at DESC;
```

Expected:
- At least one row exists.
- `token` matches the API `reset_token`.
- `expires_at` is in the future.

### Negative Tests
1. Missing email -> expect `400`
2. Unknown email -> expect `404`

### Verify in Backend Logs
- `POST /api/forgot-password | 200/400/404`

---

## 8) API #5 - Reset Password

### Request
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/reset-password`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "token": "{{resetToken}}",
  "new_password": "brandNewSecret456"
}
```

### Expected API Result
- Status: `200 OK`
- Password is updated.
- Reset token(s) for that user are removed.

### Verify in PostgreSQL

1) Check reset rows cleared:

```sql
SELECT *
FROM password_resets
WHERE token = '{{resetToken}}';
```

Expected: `0 rows`.

2) Confirm user can sign in with new password:
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/signin`
- **Body:**

```json
{
  "email": "{{testEmail}}",
  "password": "brandNewSecret456"
}
```

Expected: `200 OK`.

### Negative Tests
1. Missing `token` or `new_password` -> `400`
2. Invalid token -> `400`
3. Expired token -> `400`

### Verify in Backend Logs
- `POST /api/reset-password | 200/400`

---

## 9) Fast End-to-End Verification Flow

Run these in order in Postman:

1. `GET /api/menu-items` -> pick `menuItemId`
2. `PUT /api/cart/{{userId}}/item/{{menuItemId}}` -> set quantity
3. `GET /api/cart/{{userId}}` -> verify quantity/subtotal
4. `POST /api/forgot-password` -> capture `resetToken`
5. `POST /api/reset-password` -> reset password
6. `POST /api/signin` with new password -> final confirmation

If all pass and DB queries match, the 5 new APIs are verified.

---

## 10) Notes for Demo/Review

- `forgot-password` currently returns token in API response for development/testing convenience.
- In production, token should be sent via email and never returned directly.
- If you restart with a fresh DB, first run `go run main.go` once so migrations and seed data are ready.

