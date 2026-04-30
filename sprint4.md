# Sprint 4 - GatorDash

## Visual Demo Links
- Frontend Demo Video (Frontend Raghul Video): https://drive.google.com/file/d/1Pnnmbx-uPszaK-CXIhx7IMMla4b2Kz7A/view
- Frontend Demo Video (Frontend Arvindh Video1): https://drive.google.com/file/d/1ue1aNndr8gEE-bkSKbCUcr85MnHnWrfK/view
- Frontend Demo Video (Frontend Arvindh Video2) : https://drive.google.com/file/d/1B_HkFYQVChgLxeOD4ajVal2xNyQkLj7W/view
- Backend Demo Video: 
- GitHub Repository: https://github.com/trineshreddy/GatorDash

---

## Team Contributions

| Member | Role | Sprint 4 Responsibilities |
|--------|------|--------------------------|
| **Arvind Krishna Sundararajan** | Frontend | JWT-aware sign-in/session handling, Payment page, payment-gated Order Summary, protected cart/order/payment API headers, checkout bug fixes, menu cleanup, Jest tests |
| **Raghul Siddarath Chandrasekar** | Frontend | FoodStalls/Menu UI updates, restaurant cards, Navbar/Profile/OrderHistory integration, reorder UI support, Cypress E2E updates, frontend polish |
| **Trinesh Reddy Bayapureddy Sannala** | Backend | JWT middleware, protected routes, order placement API, order history API, reorder API, mock payment API, backend tests, seed data updates |

**Backend Tech Stack:**
- Language: Go (Golang)
- Framework: Gin
- Database: PostgreSQL (SQLite for test isolation)
- ORM: GORM
- Auth: JWT middleware + bcrypt password hashing
- Testing: Go `testing` + `httptest` + in-memory SQLite

**Frontend Tech Stack:**
- Language: JavaScript
- Framework: React 18
- Routing: React Router v6
- State/session storage: localStorage with JWT token support
- Testing: Jest + React Testing Library, Cypress E2E

---

## Sprint 4 Objectives

In Sprint 4, our team focused on completing the final product experience and closing the main gaps from Sprint 3:

1. **Secure protected workflows with JWT** - issue JWT tokens on sign in and protect user, cart, payment, and order routes.
2. **Complete checkout** - add mock payment processing and prevent unpaid order placement.
3. **Persist real orders** - create backend order placement and order history APIs.
4. **Support reorder** - allow users to add previous order items back to the cart.
5. **Improve restaurant/menu data** - add restaurant image support and replace generic menu item names with realistic food names.
6. **Fix integration issues** - align frontend request bodies, JWT headers, and backend route shapes.
7. **Expand and verify tests** - keep Sprint 3 tests passing while adding Sprint 4 coverage for auth, payment, order, cart, and reorder behavior.
8. **Prepare final documentation** - update Sprint 4 documentation with completed work, tests, and API details.

---

## User Stories

**Authentication Stories**
- As a user, I want my sign-in session to use a backend-issued JWT so protected actions are secure.
- As a user, I want expired or invalid sessions to send me back to Sign In instead of failing silently.

**Checkout & Payment Stories**
- As a user, I want to review my cart before checkout.
- As a user, I want to complete a payment step before my order is placed.
- As a user, I want unpaid orders to be blocked so checkout behaves correctly.
- As a user, I want to see an order confirmation after successful payment and order placement.

**Order Management Stories**
- As a user, I want my order to be saved in the backend after checkout.
- As a user, I want to view my past orders in Order History.
- As a user, I want to reorder items from a previous order.

**Browsing & Demo Quality Stories**
- As a user, I want restaurant cards to show relevant images.
- As a user, I want menu items to have realistic food names instead of placeholder labels.

---

## Issues Planned for Sprint 4

### Backend Issues
- Implement JWT token generation on sign in
- Implement JWT authentication middleware
- Protect user, cart, payment, and order APIs
- Add `Order` and `OrderItem` models
- Implement mock payment processing API
- Implement order placement API
- Implement order history API
- Implement reorder API
- Add validation for payment/order/cart edge cases
- Add backend tests for JWT, payment, order placement, order history, reorder, and protected routes
- Update backend seed data for restaurant cards and menu data

### Frontend Issues
- Store JWT token returned from sign in
- Send JWT `Authorization: Bearer <token>` headers on protected API calls
- Build Payment page with validation and success state
- Require successful payment before order placement
- Connect Order Summary to protected cart and order APIs
- Connect Order History to backend order APIs
- Implement reorder flow from Order History
- Update Navbar logout/session cleanup
- Remove irrelevant item images from Menu page
- Add/maintain Jest tests for payment, cart, order summary, order history, profile, menu, and auth
- Update Cypress E2E tests for Sprint 4 flows

---

## Issues Successfully Completed

### Backend
- ✅ JWT token generation added to `POST /api/signin`
- ✅ JWT middleware added for protected route groups
- ✅ Protected routes added for users, cart, payment, order placement, order history, and reorder
- ✅ Mock payment API implemented: `POST /api/payment/process`
- ✅ Order placement API implemented: `POST /api/order/place`
- ✅ Order history API implemented: `GET /api/orders/:user_id`
- ✅ Reorder API implemented: `POST /api/orders/:order_id/reorder`
- ✅ Order and order item models added with database migration support
- ✅ Cart validation, order validation, payment validation, and unauthorized access tests added
- ✅ Seed data updated so food stalls include color and image URLs
- ✅ Backend tests pass using isolated SQLite test databases

**Backend Work Distribution:**
- Trinesh: JWT middleware, protected route setup, payment/order/reorder APIs, database models, backend validation, backend tests, API documentation updates

### Frontend
- ✅ Sign-in flow updated to store backend JWT under `authToken`
- ✅ Protected API calls updated to send JWT headers consistently
- ✅ Payment page built with cardholder name, card number, expiry, CVV, and ZIP validation
- ✅ Payment request payload aligned with backend: `amount`, `expiry_month`, `expiry_year`, `cvv`, `billing_zip`
- ✅ Order Summary blocks order placement until payment succeeds
- ✅ Order placement connected to `POST /api/order/place`
- ✅ Cart fetch/update/remove/clear connected to protected backend APIs
- ✅ Order History connected to `GET /api/orders/:user_id`
- ✅ Order History normalized backend fields (`order_id`, `total_amount`) for frontend display
- ✅ Reorder flow connected to `POST /api/orders/:order_id/reorder`
- ✅ Navbar logout no longer calls a nonexistent `/api/logout`; it clears local JWT/session state client-side
- ✅ Session-expiry cleanup added for protected API `401` responses
- ✅ Restaurant image display kept on FoodStalls page
- ✅ Menu item images removed from Menu page
- ✅ Generic menu names replaced with realistic food item names in backend seed data
- ✅ Extra generated project docs removed from final submission
- ✅ Frontend Jest tests pass after Sprint 4 changes

**Frontend Work Distribution:**
- Arvind: JWT-aware sign-in session storage, Payment page, payment-gated Order Summary, protected API header fixes for Cart/OrderSummary/Payment/OrderHistory/Profile/Menu/Navbar, menu cleanup, backend seed cleanup support, Jest updates
- Raghul: FoodStalls/Menu presentation updates, Navbar/Profile/OrderHistory UI work, reorder UI behavior, Cypress E2E updates, frontend polish

### Sprint 3 Items Strengthened in Sprint 4
- ✅ Sprint 3 cart/order summary API integrations now use JWT-protected requests
- ✅ Sprint 3 Order History page now uses real backend order history data
- ✅ Sprint 3 localStorage fallbacks remain available, but core demo flow now uses backend APIs
- ✅ Sprint 3 frontend and backend tests remain passing

---

## Final Product Overview

GatorDash is now a complete full-stack food ordering application. A user can:

1. Sign up or sign in
2. Browse restaurant/food stall cards
3. View menu items from the backend
4. Add items to a backend-backed cart
5. Update, remove, or clear cart items
6. Review order summary with subtotal, tax, and total
7. Complete mock payment
8. Place an order
9. View past orders in Order History
10. Reorder from a previous order
11. View and update profile information
12. Use password reset flow if they forget their password

---

## Backend API Documentation

### Public Authentication & Recovery
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/signup` | POST | Register a new user |
| `/api/signin` | POST | Authenticate user and return JWT token |
| `/api/forgot-password` | POST | Issue password reset token |
| `/api/reset-password` | POST | Reset password using valid token |

### Public Food Stalls & Menu
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/foodstalls` | GET | Fetch all food stalls |
| `/api/foodstalls/:id/menu` | GET | Get menu for one stall |
| `/api/menu-items` | GET | Get all menu items |
| `/api/menu-items/by-name?name=...` | GET | Search menu items by exact case-insensitive name |

### Protected User Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users` | GET | Get all users |
| `/api/user/:id` | GET | Get user by ID |
| `/api/user/:id` | PUT | Update user details |
| `/api/user/:id` | DELETE | Delete user |

### Protected Cart Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cart/add` | POST | Add menu item to cart |
| `/api/cart/:user_id` | GET | View user's cart |
| `/api/cart/:user_id/item/:menu_item_id` | PUT | Update item quantity |
| `/api/cart/:user_id/item/:menu_item_id` | DELETE | Remove item from cart |
| `/api/cart/:user_id/clear` | DELETE | Clear user's cart |

### Protected Payment & Orders
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payment/process` | POST | Process mock payment |
| `/api/order/place` | POST | Place order from cart |
| `/api/orders/:user_id` | GET | Fetch user's order history |
| `/api/orders/:order_id/reorder` | POST | Add previous order items back to cart |

**Total documented API endpoints: 20**

---

## Testing

### Backend Unit Tests
Tested using Go's `testing` and `httptest` packages with isolated SQLite databases.

| Test File | Test Coverage | Status |
|-----------|---------------|--------|
| `user_api_test.go` | Signup, signin, fetch user, update user, delete user, forgot/reset password, protected-route auth failures | ✅ Passed |
| `foodstall_api_test.go` | Fetch food stalls, fetch menu for stall | ✅ Passed |
| `menu_api_test.go` | Get all menu items, search by name, missing query, not found | ✅ Passed |
| `cart_api_test.go` | Add cart item, fetch cart, delete item, clear cart, update quantity, unauthorized access | ✅ Passed |
| `payment_api_test.go` | Payment success, declined payment, missing fields, unauthorized payment | ✅ Passed |
| `order_api_test.go` | Place order, order history, reorder, empty cart, unauthorized history/reorder, nonexistent order | ✅ Passed |

**Backend test summary:** 32 backend tests across 6 test files, all passing.

Command used:
```bash
cd Backend
GOCACHE=/tmp/gatordash-go-build-cache GOMODCACHE=/tmp/gatordash-go-mod-cache go test ./...
```

### Frontend Jest Unit Tests
Tested using Jest and React Testing Library.

| Test File | Coverage | Status |
|-----------|----------|--------|
| `SignIn.test.js` | Sign-in form, loading state, submit behavior | ✅ Passed |
| `SignUp.test.js` | Signup validation, password strength, API submit, backend errors | ✅ Passed |
| `Foodstall.test.js` | Food stall rendering, backend/fallback data, search/filter UI | ✅ Passed |
| `Menu.test.js` | Menu rendering, quantity controls, add-to-cart API, fallback data | ✅ Passed |
| `Cart.test.js` | Empty state, backend fetch, remove, clear, quantity controls, fallback data | ✅ Passed |
| `OrderSummary.test.js` | Cart fetch, totals, payment gate, order confirmation, clear cart | ✅ Passed |
| `Payment.test.js` | Payment form validation, formatting, backend payment call, session expiry | ✅ Passed |
| `OrderHistory.test.js` | Empty state, backend order fetch, mock fallback, expand cards, reorder button | ✅ Passed |
| `Profile.test.js` | Profile load, edit, validation, save to backend | ✅ Passed |
| `ForgotPassword.test.js` | Email validation, API submit, success/error states | ✅ Passed |
| `ResetPassword.test.js` | Token handling, password validation, API submit, redirect countdown | ✅ Passed |
| `Navbar.test.js` | Navigation, cart badge, sign out/session cleanup | ✅ Passed |
| `Toast.test.js` | Toast rendering, dismissal, status styles | ✅ Passed |

**Frontend Jest summary:** 13 test suites, 138 tests, all passing.

Command used:
```bash
cd frontend
npm test -- --watchAll=false
```

### Frontend Cypress E2E Tests

| Test File | Flow Covered | Status |
|-----------|--------------|--------|
| `signup.cy.js` | User registration flow | ✅ Included |
| `login.cy.js` | Login success/failure flow | ✅ Included |
| `logout.cy.js` | Logout/session cleanup flow | ✅ Included |
| `menu.cy.js` | Browse restaurants, open menu, add/reorder behavior | ✅ Included |
| `cart.cy.js` | Add to cart and cart interactions | ✅ Included |
| `profile.cy.js` | Profile view/edit flow | ✅ Included |

---

## Major Integration Fixes Completed Late in Sprint 4

| Issue | Cause | Fix |
|-------|-------|-----|
| Add to Cart returned `401` | Frontend stored JWT as `authToken`, while shared headers read `token` | `getAuthHeaders()` now reads `authToken` and legacy `token` |
| Remove item / clear cart returned `401` | Cart endpoints did not send JWT headers | Added `getAuthHeaders()` to all protected cart calls |
| Checkout returned `401` | Order Summary cart/order calls did not send JWT headers | Added JWT headers to cart fetch, order placement, and cart clear |
| Payment returned `Invalid request body` | Frontend sent `expiry` but backend required `expiry_month`, `expiry_year`, and `amount` | Updated Payment payload to match backend `PaymentRequest` |
| Logout returned `404` | Frontend called nonexistent `/api/logout` | Removed backend logout call; logout is client-side JWT/session cleanup |
| Order History did not match backend | Frontend called `/api/orders`, expected `id` and `total`; backend uses `/api/orders/:user_id`, `order_id`, `total_amount` | Updated route and normalized response fields |
| Restaurant images missing | Some image URLs returned 404 and existing DB rows had blank `image_url` | Replaced broken image URLs and updated seed/local data |
| Menu looked unpolished | Generated item names/images looked random | Replaced menu seed names with real food items and removed item images from menu cards |

---

## Architecture Decisions

### Backend
- **JWT route group** - Protected APIs are grouped under `JWTAuthMiddleware()` to avoid duplicating auth checks.
- **Mock payment endpoint** - Payment is simulated for course/demo purposes without real card processing.
- **Order persistence** - Orders and order items are stored separately so Order History and Reorder can reuse saved item details.
- **SQLite tests** - Backend tests run against isolated in-memory SQLite databases for speed and reproducibility.

### Frontend
- **Shared auth header helper** - `getAuthHeaders()` centralizes JWT header generation for protected routes.
- **Client-side logout** - JWT logout clears local session state instead of calling a backend logout endpoint.
- **Payment gate** - `OrderSummary` checks `paymentResult` before allowing `POST /api/order/place`.
- **Fallback behavior** - LocalStorage/mock fallbacks remain for demo resilience, but primary flows now use backend APIs.
- **Response normalization** - Order History normalizes backend response fields so the UI can render consistently.

---

## Known Limitations

- Payment processing is mocked and does not contact a real payment provider.
- Order status is stored as backend order state, but true real-time status updates/websockets are future work.
- Restaurant/menu seed data is demo-oriented rather than managed through an admin panel.
- Local PostgreSQL setup depends on each developer's local database user unless `.env` is configured.
- Some React Router and React `act(...)` warnings appear in test output, but all Jest suites pass.

---

## Final Test Results

### Frontend
```text
Test Suites: 13 passed, 13 total
Tests:       138 passed, 138 total
Snapshots:   0 total
```

### Backend
```text
ok   gatordash-backend/tests
```

---

## Final Project Status

Sprint 4 completes the core GatorDash product. The application now supports the full user journey from account access through restaurant browsing, menu selection, cart management, payment, order placement, order history, and reorder. The backend exposes documented REST APIs with JWT protection for sensitive actions, and both frontend and backend test suites pass with Sprint 3 and Sprint 4 functionality included.
