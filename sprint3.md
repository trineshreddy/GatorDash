# Sprint 3 – GatorDash

## Visual Demo Links
- Frontend Demo Video: https://drive.google.com/file/d/1paI2LNxMfgK8trF1a5vXRYk3TUXcMrWN/view
- Backend Demo Video: https://drive.google.com/file/d/1DKVRq48gxD3eGmXcj-0L9SvWUWfPitmZ/view
- GitHub Repository: https://github.com/trineshreddy/GatorDash

---

## Team Contributions

| Member | Role | Sprint 3 Responsibilities |
|--------|------|--------------------------|
| **Arvind Krishna Sundararajan** | Frontend | Cart ↔ Backend integration, Order Summary ↔ Backend, Forgot Password page, Reset Password page, Order History page, App routing updates, SignIn/SignUp enhancements, Jest + Cypress tests |
| **Raghul Siddarath Chandrasekar** | Frontend | FoodStalls ↔ Backend API, Menu ↔ Backend API + Cart API, Navbar ↔ Backend cart count + Logout, Profile ↔ Backend API, UI/UX polish, Jest + Cypress tests |
| **Trinesh Reddy Bayapureddy Sannala** | Backend | Forgot Password API, Reset Password API, Update Cart Quantity API, Get All Menu Items API, Get Menu Items by Name API, backend unit tests |

**Backend Tech Stack:**
- Language: Go (Golang)
- Framework: Gin
- Database: PostgreSQL (SQLite for test isolation)
- ORM: GORM
- Auth: bcrypt password hashing, token-based password reset
- Testing: Go `testing` + `httptest` + in-memory SQLite

**Frontend Tech Stack:**
- Language: JavaScript
- Framework: React 18
- Routing: React Router v6
- Testing: Jest + React Testing Library, Cypress (E2E)

---

## Sprint 3 Objectives

In Sprint 3, our team aimed to:

1. **Complete full frontend-backend integration** — replace all localStorage-only flows with live API calls (Cart, Menu, FoodStalls, Profile, Auth).
2. **Implement password recovery** — Forgot Password + Reset Password pages with backend API.
3. **Build Order History page** — new user-facing page to view past orders (not present in Sprint 2).
4. **Add new backend APIs** — Update Cart Quantity, Get All Menu Items, Get Menu Items by Name, Forgot Password, Reset Password.
5. **Implement loading, error, and empty states** — spinners, retry buttons, empty-state illustrations across all pages.
6. **Expand test coverage** — 11 Jest test files covering every component + 4 Cypress E2E test files + 15 backend unit tests.
7. **Resolve Sprint 2 deferred items** — Cart/OrderSummary backend integration, full logout flow.
8. **Polish UI/UX** — smooth transitions, responsive improvements, toast enhancements.

---

## User Stories

**Password Recovery Stories**
- As a user, I want to reset my password via email so that I can regain access to my account.
- As a user, I want to set a new password using a secure reset token.

**Order Management Stories**
- As a user, I want to place an order and see a confirmation number with estimated pickup time.
- As a user, I want to view my past orders so I can track what I've ordered.
- As a user, I want to re-order from my order history.

**Cart & Checkout Stories (Backend Integration)**
- As a user, I want my cart to persist on the server so it's available across devices.
- As a user, I want to update item quantities in my cart via the backend API.
- As a user, I want the cart badge in the navbar to reflect real-time data from the server.

**Menu & Browsing Stories (Backend Integration)**
- As a user, I want food stalls to load from the backend instead of hardcoded data.
- As a user, I want to search menu items by name across all food stalls.
- As a user, I want see menu items from the backend API.

**Profile Stories (Backend Integration)**
- As a user, I want my profile data to save to the backend and persist after logout.

---

## Issues Planned for Sprint 3

### Backend Issues
- Implement Forgot Password API (`POST /api/forgot-password`)
- Implement Reset Password API (`POST /api/reset-password`)
- Implement Update Cart Item Quantity API (`PUT /api/cart/:user_id/item/:menu_item_id`)
- Implement Get All Menu Items API (`GET /api/menu-items`)
- Implement Get Menu Items by Name API (`GET /api/menu-items/by-name?name=...`)
- Add `PasswordReset` model with token + expiry support
- Write unit tests for all new APIs + edge cases (missing params, not found, expired tokens)
- Set up in-memory SQLite test infrastructure for isolated, reproducible tests

### Frontend Issues
- **Cart ↔ Backend:** Fetch cart from `GET /api/cart/:user_id`, update via `PUT`, remove via `DELETE`, clear via `DELETE /clear`, localStorage as offline fallback
- **OrderSummary ↔ Backend:** Fetch cart from API, place order via `POST /api/order/place`, clear cart on backend, generate confirmation number, show estimated pickup time
- **ForgotPassword page [NEW]:** Email input, validation, `POST /api/forgot-password`, success/error states, loading spinner
- **ResetPassword page [NEW]:** Token from URL, new password + confirm fields, password strength meter, auto-redirect to Sign In with countdown
- **OrderHistory page [NEW]:** Fetch from API (mock fallback), expandable order cards, status badges, empty state, re-order button
- **FoodStalls ↔ Backend:** Fetch from `GET /api/foodstalls`, replace hardcoded `data.js`, search/filter
- **Menu ↔ Backend:** Fetch from `GET /api/foodstalls/:id/menu`, Add to Cart via `POST /api/cart/add`
- **Navbar ↔ Backend:** Cart count from API, Order History navigation link
- **Profile ↔ Backend:** Fetch from `GET /api/user/:id`, save via `PUT /api/user/:id`
- **App.js:** Add routes for `/forgot-password`, `/reset-password`, `/order-history`
- **SignIn.js:** Add "Forgot Password?" link
- **SignUp.js:** Show specific backend error messages, loading state on submit
- **Toast.js:** Enhanced with new info/warning types and slide-in animation
- Write 11 Jest test files for all components
- Write 4 Cypress E2E test files

---

## Issues Successfully Completed

### Backend
- ✅ Forgot Password API — generates secure random token via `crypto/rand`, stores `PasswordReset` record with 1-hour TTL, invalidates previous tokens
- ✅ Reset Password API — validates token + expiry, hashes new password with `bcrypt`, cleans up used tokens
- ✅ Update Cart Item Quantity API — `PUT /api/cart/:user_id/item/:menu_item_id` with validation for user existence, cart item existence, and positive quantity
- ✅ Get All Menu Items API — returns all 70 menu items across 7 food stalls
- ✅ Get Menu Items by Name API — case-insensitive exact match search with proper 400/404 handling
- ✅ `PasswordReset` model added to schema with `AutoMigrate` support
- ✅ In-memory SQLite test infrastructure with seed data for isolated test runs
- ✅ 15 backend unit tests across 5 test files, all passing

**Backend Work Distribution:**
- Trinesh: All backend APIs, database schema updates, unit tests, test infrastructure

### Frontend
- ✅ **Cart** fully integrated with backend: `GET /api/cart/:user_id`, `PUT` update quantity, `DELETE` remove item, `DELETE /clear`, localStorage fallback, loading spinner, error state with retry, empty state
- ✅ **OrderSummary** integrated with backend: fetches cart from API, places order via `POST /api/order/place`, clears backend cart, shows confirmation number + estimated pickup time (15–20 min)
- ✅ **ForgotPassword** page  email validation, `POST /api/forgot-password`, success screen with "Check Your Email" message, mock fallback, loading spinner button
- ✅ **ResetPassword** page reads token from URL `?token=...`, password strength meter (Weak/Fair/Strong), `POST /api/reset-password`, success screen with auto-redirect countdown to Sign In, password visibility toggle
- ✅ **OrderHistory** page expandable order cards with status badges (Delivered/Preparing/Cancelled/Ready), date formatting, item breakdown with prices, "Order Again" button for delivered orders, empty state with "Browse Restaurants"
- ✅ **FoodStalls** connected to `GET /api/foodstalls` with hardcoded fallback
- ✅ **Menu** connected to `GET /api/foodstalls/:id/menu` + Add to Cart calls `POST /api/cart/add`
- ✅ **Navbar** updated with Order History link, logout clears localStorage
- ✅ **Profile** integrated with `GET /api/user/:id` and `PUT /api/user/:id`
- ✅ **App.js** updated with 3 new routes: `/forgot-password`, `/reset-password`, `/order-history`
- ✅ **SignIn** now includes "Forgot Password?" link
- ✅ **SignUp** shows backend error messages, loading state on submit
- ✅ **Toast** enhanced with slide-in animation, z-index layering
- ✅ 11 Jest test files covering every component
- ✅ 4 Cypress E2E test files

**Frontend Work Distribution:**
- Arvind: Cart ↔ backend, OrderSummary ↔ backend, ForgotPassword page, ResetPassword page, OrderHistory page, App.js routing, SignIn + SignUp improvements, Cart + ForgotPassword + OrderHistory + OrderSummary + ResetPassword + SignIn + SignUp + Toast Jest tests
- Raghul: FoodStalls ↔ backend, Menu ↔ backend + cart API, Navbar ↔ backend cart count, Profile ↔ backend, Menu + Navbar + Profile Jest tests, Cypress E2E tests

### Sprint 2 Deferred Items Resolved
- ✅ Cart/OrderSummary connected to backend Cart APIs (was localStorage-only in Sprint 2)
- ✅ Full logout flow (was client-side only)
- ✅ FoodStalls and Menu fetched from backend APIs (were hardcoded in `data.js`)

---

## Backend API Documentation

### Authentication & User Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/signup` | POST | Register a new user |
| `/api/signin` | POST | Authenticate user |
| `/api/forgot-password` | POST | Issue password reset token |
| `/api/reset-password` | POST | Reset password using valid token |
| `/api/users` | GET | Get all users |
| `/api/user/:id` | GET | Get user by ID |
| `/api/user/:id` | PUT | Update user details |
| `/api/user/:id` | DELETE | Delete a user |

### Food Stalls & Menu
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/foodstalls` | GET | Fetch all food stalls |
| `/api/foodstalls/:id/menu` | GET | Get menu for a stall |
| `/api/menu-items` | GET | Get all menu items from all stalls |
| `/api/menu-items/by-name?name=...` | GET | Search menu items by name (case-insensitive) |

### Cart Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cart/add` | POST | Add item to cart |
| `/api/cart/:user_id` | GET | View cart items |
| `/api/cart/:user_id/item/:menu_item_id` | PUT | Update cart item quantity |
| `/api/cart/:user_id/item/:menu_item_id` | DELETE | Remove item from cart |
| `/api/cart/:user_id/clear` | DELETE | Clear entire cart |

**Total: 17 API endpoints (5 new in Sprint 3)**

---

## Architecture Decisions

### Backend
- **In-memory SQLite for tests** — Each test function gets its own isolated in-memory database (`file:<test_name>?mode=memory&cache=shared`), eliminating inter-test dependencies and enabling parallel execution without external infrastructure
- **Token-based password recovery** — 32-byte cryptographically random tokens with 1-hour TTL, stored as `PasswordReset` records rather than JWTs, to allow server-side invalidation
- **Unified `setup_test.go`** — Shared helper functions (`setupTestRouter`, `performRequest`, `parseResponse`, `seedFoodData`) to eliminate duplication across test files

### Frontend
- **Optimistic UI updates** — Cart operations (update quantity, remove, clear) immediately update local state and dispatch `cartUpdated` events before the API call completes, ensuring responsive UI regardless of network latency
- **Graceful degradation** — Every API call includes a `catch` that falls back to localStorage so the app remains functional when the backend is unavailable
- **Mock fallback for demo** — OrderHistory and ForgotPassword include realistic mock data so the app can be demonstrated without a running backend

---

## Testing

### Backend Unit Tests
Tested using Go's `testing` and `httptest` packages with in-memory SQLite databases for full isolation.

| Test Name | File | Status | Description |
|-----------|------|--------|-------------|
| `TestSignup` | `user_api_test.go` | ✅ Passed | Registers user, verifies 200 + user ID in response |
| `TestSignin` | `user_api_test.go` | ✅ Passed | Signs up then signs in, verifies authentication |
| `TestFetchUser` | `user_api_test.go` | ✅ Passed | Retrieves user by ID after signup |
| `TestEditUser` | `user_api_test.go` | ✅ Passed | Updates name/phone, re-fetches and verifies changes |
| `TestDeleteUser` | `user_api_test.go` | ✅ Passed | Deletes user, confirms 404 on subsequent GET |
| `TestForgotAndResetPassword` | `user_api_test.go` | ✅ Passed |  Full flow: signup → forgot → extract token → reset → sign in with new password |
| `TestFetchFoodStalls` | `foodstall_api_test.go` | ✅ Passed | Seeds 7 stalls, verifies non-empty response |
| `TestGetFoodMenu` | `foodstall_api_test.go` | ✅ Passed | Fetches menu for `stall_1`, verifies items exist |
| `TestGetAllMenuItems` | `menu_api_test.go` | ✅ Passed |  Verifies all 70 seeded menu items returned |
| `TestGetMenuItemsByName` | `menu_api_test.go` | ✅ Passed | Searches "Item 1.1", verifies exact match |
| `TestGetMenuItemsByNameMissingQuery` | `menu_api_test.go` | ✅ Passed |  Verifies 400 when `?name=` is missing |
| `TestGetMenuItemsByNameNotFound` | `menu_api_test.go` | ✅ Passed | Verifies 404 for nonexistent item |
| `TestAddItemsToCart` | `cart_api_test.go` | ✅ Passed | Adds item, verifies cart has 1 item |
| `TestFetchCartItems` | `cart_api_test.go` | ✅ Passed | Adds 2 items, verifies cart has 2 items |
| `TestDeleteItemFromCart` | `cart_api_test.go` | ✅ Passed | Adds then removes item, verifies empty cart |
| `TestEmptyCart` | `cart_api_test.go` | ✅ Passed | Adds item then clears cart, verifies empty |
| `TestUpdateCartItemQuantity` | `cart_api_test.go` | ✅ Passed | Adds item (qty 2), updates to qty 5, verifies |

**Backend test summary: 17 tests across 5 files (6 new in Sprint 3), all passing.**

---

**Example Backend Test — Forgot + Reset Password (Full Flow):**
```go
func TestForgotAndResetPassword(t *testing.T) {
    router, _ := setupTestRouter(t)
    email := "resetme@example.com"
    signupUserAndGetID(t, router, email)

    // Step 1: Request password reset
    forgot := performRequest(router, http.MethodPost, "/api/forgot-password", map[string]interface{}{
        "email": email,
    })
    if forgot.Code != http.StatusOK {
        t.Fatalf("forgot password expected 200, got %d", forgot.Code)
    }
    resp := parseResponse(t, forgot)
    var data map[string]interface{}
    json.Unmarshal(resp.Data, &data)
    token := data["reset_token"].(string)

    // Step 2: Reset password with token
    reset := performRequest(router, http.MethodPost, "/api/reset-password", map[string]interface{}{
        "token":        token,
        "new_password": "brandNewSecret456",
    })
    if reset.Code != http.StatusOK {
        t.Fatalf("reset password expected 200, got %d", reset.Code)
    }

    // Step 3: Sign in with new password
    signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
        "email":    email,
        "password": "brandNewSecret456",
    })
    if signin.Code != http.StatusOK {
        t.Fatalf("signin with new password expected 200, got %d", signin.Code)
    }
}
```

**Example Backend Test — Update Cart Item Quantity:**
```go
func TestUpdateCartItemQuantity(t *testing.T) {
    router, db := setupTestRouter(t)
    seedFoodData(t, db)

    // Signup and get user ID
    signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
        "name": "Qty User", "email": "qtycart@example.com",
        "phone": "9999999995", "password": "password123",
    })
    signupResp := parseResponse(t, signup)
    var signupData map[string]interface{}
    json.Unmarshal(signupResp.Data, &signupData)
    userID := signupData["id"].(string)

    // Add item with quantity 2
    performRequest(router, http.MethodPost, "/api/cart/add", map[string]interface{}{
        "user_id": userID, "menu_item_id": "menu_1", "quantity": 2,
    })

    // Update quantity to 5
    put := performRequest(router, http.MethodPut, "/api/cart/"+userID+"/item/menu_1", map[string]interface{}{
        "quantity": 5,
    })
    if put.Code != http.StatusOK {
        t.Fatalf("update cart quantity expected 200, got %d", put.Code)
    }

    // Verify
    view := performRequest(router, http.MethodGet, "/api/cart/"+userID, nil)
    viewResp := parseResponse(t, view)
    var cartItems []map[string]interface{}
    json.Unmarshal(viewResp.Data, &cartItems)
    qty := cartItems[0]["quantity"].(float64)
    if int(qty) != 5 {
        t.Fatalf("expected quantity 5, got %v", qty)
    }
}
```

---

### Frontend Jest Unit Tests
Tested using React Testing Library and Jest.

| Test File | Components Tested | Status |
|-----------|-------------------|--------|
| `SignIn.test.js` | Sign In form rendering, credential submission, password toggle, Forgot Password link | ✅ Passed |
| `SignUp.test.js` | Form validation (email, phone, password rules), strength meter, API submit, error handling | ✅ Passed |
| `Cart.test.js` | Backend API integration (mock fetch), loading/error states, quantity controls, remove/clear, localStorage fallback | ✅ Passed |
| `OrderSummary.test.js` | Renders items from API, subtotal/tax/total calculation, Place Order button, loading state, confirmation screen | ✅ Passed |
| `ForgotPassword.test.js` | Form rendering, email validation, API submit, success/error messages, loading state | ✅ Passed |
| `ResetPassword.test.js` | Token from URL, password validation, strength meter, API submit, countdown redirect | ✅ Passed |
| `OrderHistory.test.js` | Order list rendering, empty state, loading state, expandable cards, status badges | ✅ Passed |
| `Menu.test.js` | Menu item rendering, stall name display, Add to Cart, API integration | ✅ Passed |
| `Navbar.test.js` | Brand rendering, cart badge, sign out, Order History link | ✅ Passed |
| `Profile.test.js` | User info display, edit mode, save via API, validation | ✅ Passed |
| `Toast.test.js` | Toast rendering for success/error/info/warning types, auto-dismiss, close button | ✅ Passed |

**Frontend test summary: 11 Jest test files (6 new + 5 updated in Sprint 3), all passing.**

---

**Example Jest Test — Cart Backend Integration:**
```js
test('fetches cart items from backend API on mount', async () => {
    const mockCartData = {
        success: true,
        data: [
            { menu_item_id: '1', name: 'Burger', price: 8.99, quantity: 2 },
            { menu_item_id: '2', name: 'Fries', price: 3.49, quantity: 1 },
        ],
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCartData),
    });

    render(<Cart onLogout={jest.fn()} showToast={jest.fn()} />);

    await waitFor(() => {
        expect(screen.getByText('Burger')).toBeInTheDocument();
        expect(screen.getByText('Fries')).toBeInTheDocument();
    });
});
```

**Example Jest Test — Forgot Password Flow:**
```js
test('submits email and shows success message', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Token issued' }),
    });

    render(
        <MemoryRouter>
            <ForgotPassword showToast={jest.fn()} />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/registered email/i), {
        target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => {
        expect(screen.getByText(/Check Your Email/i)).toBeInTheDocument();
    });
});
```

---

### Frontend Cypress E2E Tests

| Test File | Description | Status |
|-----------|-------------|--------|
| `signup.cy.js` | User registration flow — fills form, submits, verifies redirect | ✅ Passed |
| `login.cy.js` | Login with valid/invalid credentials, verifies toast messages | ✅ Passed |
| `menu.cy.js` | Browse food stall, view menu items, add to cart | ✅ Passed |
| `cart.cy.js` | Add items to cart, update quantities, remove items, proceed to checkout | ✅ Passed |

---

## Next Steps (Sprint 4)
- Payment integration (Stripe/PayPal)
- JWT authentication middleware
- Real-time order status tracking
- Restaurant ratings & reviews
- Push notifications for order updates
- Dark mode toggle
- Favorites / wishlist feature
- Re-order from order history (wire to backend)
