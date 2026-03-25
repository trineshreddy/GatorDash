# Sprint 2 – GatorDash

## Submission Details
- Frontend Demo Video: [Link]
- Backend Demo Video: [Link]
- GitHub Repository: https://github.com/as8313/SE-PROJECT-CEN5035-

## Team Contributions
- Backend: Trinesh Reddy Bayapureddy Sannala
- Frontend: Arvind Krishna Sundararajan, Raghul Siddarath Chandrasekar

**Backend Tech Stack:**
- Language: Go (Golang)
- Framework: Gin
- Database: PostgreSQL
- Testing: Go `testing` + `httptest`

**Frontend Tech Stack:**
- Language: JavaScript
- Framework: React
- Testing: Jest + React Testing Library, Cypress (E2E)

## User Stories
**Food Browsing Stories**
- As a user, I want to browse available food stalls.
- As a user, I want to search and filter restaurants.
- As a user, I want to view the menu for a specific food stall.

**Cart & Ordering Stories**
- As a user, I want to add items to my cart from a menu.
- As a user, I want to adjust item quantities in my cart.
- As a user, I want to remove items or clear my cart.
- As a user, I want to see an order summary with tax and total before placing an order.

**Profile & Auth Stories**
- As a user, I want my login to persist across page refreshes.
- As a user, I want to view and edit my profile.

## Issues Planned for Sprint 2
**Backend Issues**
- Implement Food Stall listing API
- Implement Menu retrieval API for specific stalls
- Implement Add to Cart API
- Implement View Cart API
- Implement Remove Item from Cart API
- Implement Clear Cart API
- Finalize database schema (users, foodstalls, menu, cart tables)
- Insert seed data for food stalls and menu items
- Write backend unit tests for all endpoints

**Frontend Issues**
- Connect Sign In to backend API with mock fallback
- Connect Sign Up to backend API with redirect to Sign In
- Persist auth state using localStorage
- Build Cart page with quantity controls, remove, and clear
- Build Order Summary page with subtotal, tax, and checkout
- Build Profile page with view/edit functionality
- Add search/filter bar on Food Stalls page
- Add cart badge to Navbar with live count
- Add Profile and Cart navigation to Navbar
- Wire Add to Cart button on Menu page
- Write Jest unit tests for frontend components
- Write Cypress E2E tests for user flows

## Issues Successfully Completed
**Backend**
- Food Stall listing API (`GET /api/foodstalls`)
- Menu retrieval API (`GET /api/foodstalls/:id/menu`)
- Add to Cart API (`POST /api/cart/add`)
- View Cart API (`GET /api/cart/:user_id`)
- Remove Item API (`DELETE /api/cart/:user_id/item/:menu_item_id`)
- Clear Cart API (`DELETE /api/cart/:user_id/clear`)
- Database schema with 4 tables: `users`, `foodstalls`, `menu`, `cart`
- Seed data for food stalls and menu items
- 11 unit tests passing across user, food stall, and cart endpoints

**Backend Work Distribution**
- Trinesh: All backend APIs, database schema, seed data, unit tests

**Frontend**
- Sign In connected to `POST /api/signin` with mock fallback for offline dev
- Sign Up connected to `POST /api/signup` with redirect to Sign In
- Auth persistence via localStorage (survives page refresh)
- Cart page with quantity controls (+/−), remove, clear, running total
- Order Summary with subtotal, 7% tax, total, and place order confirmation
- Profile page with view/edit and localStorage sync
- Search bar on Food Stalls to filter by name or cuisine
- Cart badge on Navbar with live item count
- Profile and Cart navigation buttons in Navbar
- Add to Cart wired on Menu page with Toast feedback
- 5 Jest test files (SignIn, Cart, Menu, Navbar, Profile)
- 4 Cypress E2E test files (signup, login, menu, cart)

**Frontend Work Distribution**
- Arvind: API integration (SignIn, SignUp), auth persistence, Cart component, Order Summary, SignIn + Cart Jest tests
- Raghul: Add to Cart logic, Navbar enhancements (cart badge, profile link), Profile page, Food Stalls search, Cypress E2E tests, Menu + Navbar + Profile Jest tests

## Sprint 1 Issues Resolved
- Frontend-backend integration (was not completed in Sprint 1)
- Auth state persistence (sessions were lost on refresh)

## Backend API Documentation

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/signup` | POST | Register a new user |
| `/api/signin` | POST | Authenticate user |
| `/api/users` | GET | Get all users |
| `/api/user/:id` | GET | Get user by ID |
| `/api/user/:id` | PUT | Update user details |
| `/api/user/:id` | DELETE | Delete a user |

### Food Stalls & Menu
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/foodstalls` | GET | Fetch all food stalls |
| `/api/foodstalls/:id/menu` | GET | Get menu for a stall |

### Cart
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cart/add` | POST | Add item to cart |
| `/api/cart/:user_id` | GET | View cart items |
| `/api/cart/:user_id/item/:menu_item_id` | DELETE | Remove item from cart |
| `/api/cart/:user_id/clear` | DELETE | Clear entire cart |

## Testing
### Backend Unit Tests
Tested using Go's `testing` and `httptest` packages.

| Test | File | Status |
|------|------|--------|
| TestSignup | user_api_test.go | ✅ Passed |
| TestSignin | user_api_test.go | ✅ Passed |
| TestFetchUser | user_api_test.go | ✅ Passed |
| TestEditUser | user_api_test.go | ✅ Passed |
| TestDeleteUser | user_api_test.go | ✅ Passed |
| TestFetchFoodStalls | foodstall_api_test.go | ✅ Passed |
| TestGetFoodMenu | foodstall_api_test.go | ✅ Passed |
| TestAddItemsToCart | cart_api_test.go | ✅ Passed |
| TestFetchCartItems | cart_api_test.go | ✅ Passed |
| TestDeleteItemFromCart | cart_api_test.go | ✅ Passed |
| TestEmptyCart | cart_api_test.go | ✅ Passed |

### Frontend Jest Tests
Tested using React Testing Library and Jest.

| Test File | Description | Status |
|-----------|-------------|--------|
| SignIn.test.js | Renders form, submits credentials, password toggle | ✅ Passed |
| Cart.test.js | Empty state, item display, total calculation, remove, clear | ✅ Passed |
| Menu.test.js | Renders menu items, stall name display | ✅ Passed |
| Navbar.test.js | Brand rendering, cart badge, sign out | ✅ Passed |
| Profile.test.js | User info display, edit mode, save | ✅ Passed |

### Frontend Cypress E2E Tests

| Test File | Description | Status |
|-----------|-------------|--------|
| signup.cy.js | User registration flow | ✅ Passed |
| login.cy.js | Login with valid/invalid credentials | ✅ Passed |
| menu.cy.js | Browse stall and view menu | ✅ Passed |
| cart.cy.js | Add item to cart and verify | ✅ Passed |

## Challenges Faced & Solutions
| Challenge | Solution |
|-----------|----------|
| CORS errors between frontend and backend | Configured `proxy` in `package.json` to forward requests to port 8080 |
| Backend unavailable during frontend dev | Built mock fallback — frontend detects backend availability automatically |
| Merge conflicts from parallel frontend work | Split tasks by file ownership so each dev only edits their files |
| Cart state not syncing between Menu and Navbar | Used localStorage with custom `cartUpdated` window events |
| Login session lost on page refresh | Initialized `isLoggedIn` from localStorage on app startup |
| Search filter breaking stall navigation | Used `stalls.indexOf(stall)` to preserve correct IDs after filtering |

## Next Steps (Sprint 3):
- JWT authentication middleware (planned for Sprint 3)
- Connecting Cart/OrderSummary to backend Cart APIs (currently using localStorage, backend APIs are ready)
- Payment integration (planned for Sprint 3)


