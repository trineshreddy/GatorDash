# Sprint 1 – GatorDash
## Submission Details
- Frontend Demo Video: https://drive.google.com/file/d/18DtPeuV_5tVqjl9N_0mSN4ncVHmO3UN_/view
- Backend Demo Video: https://drive.google.com/file/d/1wK8mj8ckc3jLcuo7_I7Cp1vUP4ydoLTL/view

## Team Contributions
- Backend: Raghul Siddarath Chandrasekar, Trinesh Reddy Bayapureddy Sannala
- Frontend: Arvind Krishna Sundararajan
  
**Backend Tech Stack:**
- Language: Go (Golang)
- Database: PostgreSQL
- API Testing: Postman
  
**Frontend Tech Stack:**
- Language: JavaScript
- Framework: React

## User Stories
**User Management Stories**
- As a new user, I want to sign up so that I can create an account.
- As a registered user, I want to sign in so that I can access my account securely.
- As a user, I want to view my profile details.
- As an admin, I want to view all registered users.
- As a user, I want to update my profile information.
- As a user, I want to delete my account.

## Issues Planned for Sprint 1
**Backend Issues**
- Setup Go project structure
- Configure PostgreSQL database connection
- Implement User model
- Implement Signup API
- Implement Signin API
- Implement Get User API
- Implement Get All Users API
- Implement Update User API
- Implement Delete User API
- Test APIs using Postman


**Frontend Issues**
- Initialize the  React project and set up design system (CSS variables, color palette, Google Fonts)
- Implement Sign Up page with form fields (Name, Email, Phone, Password, Confirm Password)
- Add form validation on Sign Up (email format, 10-digit phone, password strength rules)
- Add live password strength indicator and password visibility toggle
- Implement Sign In page with mock authentication flow
- Implement Toast notification system for success/error feedback
- Build Navbar component with GatorDash branding and Sign Out
- Build Food Stalls page with restaurant list, status badges, and animations
- Set up React Router with protected routes and page transition animations
- Create custom 404 Not Found page

## Issues Successfully Completed
**Backend**
- Project structure setup
- PostgreSQL database integration
- User model creation
- Signup API implemented
- Signin API implemented
- Get User API implemented
- Get All Users API implemented
- Update User API implemented
- Delete User API implemented
- APIs tested using Postman
**Backend Work Distribution**
- Raghul: Signup, Signin, Setup Go project structure,Get All Users
- Trinesh : Get User by ID, Update User, Delete User, Configure PostgreSQL database connection
**Frontend**
- React project initialized with custom design system and UF Gator branding
- Sign Up page with full form validation (email, phone, password rules)
- Live password strength indicator (Weak / Fair / Strong)
- Password visibility toggle on Sign Up and Sign In
- Sign In page with mock authentication
- Toast notification system for sign-in success/error feedback
- Navbar component with branding and Sign Out button
- Food Stalls page with restaurant list, status badges, and staggered animations
- React Router setup with protected routes and page transition animations
- Custom 404 Not Found page

## Issues Not Completed & Reasons
- Full frontend-backend integration (limited time in Sprint 1)
- Authentication middleware / JWT implementation (planned for Sprint 2)
- Role-based access control

Reason: Sprint 1 focused primarily on building foundational user management APIs and a complete, polished frontend foundation.

