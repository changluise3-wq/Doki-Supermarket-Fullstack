# Full-Stack E-Commerce System

A comprehensive web application featuring a robust management dashboard, real-time inventory tracking, and a seamless checkout experience.

## Tech Stack
* **Frontend:** React.js, Axios, React Router
* **Backend:** Node.js (Express), JWT Authentication
* **Database:** MySQL (Relational Database Management)

---

## Key Features
* **Authentication:** Secure login/register with JWT tokens.
* **Admin Controls:** Manage user permissions (User/Admin) and account status (Active/Suspended).
* **Real-time Feedback:** Instant UI updates for cart modifications and search results.

## Installation
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Import `doki.sql` into your MySQL server.
4. Start backend: `node server.js`.
5. Start frontend: `npm run dev`.

---

### Student 1: Yu-Ching, WU (Student ID: 25729536)
**Focus:** User Authentication Module, Customer-Facing Shopping Cart Logic, and Final Checkout Implementation.

* **User Authentication & Security (Requirement 1):** Designed and implemented the client-side authentication system, including session state persistence using JWT and local storage tokens. Developed input validation and error handling for the interactive authentication view.
* **Persistent Shopping Cart Logic:** Engineered the front-end cart subsystem. Built components to dynamic-render item subtotals, handle real-time item increments/decrements, and manage individual deletions.
* **Integration of Core Feature Set:** Co-developed endpoints for user session security and token verification on customer routes.
* **Files Implemented/Modified:** `LoginModal.jsx`, `CartPage.jsx`, `CheckoutPage.jsx`, App.css (Modal & Cart styles).

---

### Student 2: Jui-Yu, Chang (Student ID: 25608480)
**Focus:** Relational Database Architecture, Real-Time Filtering Systems, and Admin Domain Management.

* **Live Search Architecture (Requirement 2):** Developed the real-time product filtering engine, utilizing stateful React query changes to sort and look up inventory instantly as the user types.
* **Admin Dashboard & Profile Management (Requirement 3):** Designed the centralized administration interface allowing managers to execute CRUD controls on users and observe all global carts via relational database queries.
* **Database Foundations & Security:** Constructed the doki.sql schemas and established the back-end environment file security configuration to eliminate hardcoded credentials.
* **Files Implemented/Modified:** `AdminDashboard.jsx`, `UserProfile.jsx`, `Shop.jsx`, `server.js`, `doki.sql`.