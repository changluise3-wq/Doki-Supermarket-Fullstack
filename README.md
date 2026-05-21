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

## Student 1: Jui-Yu, Chang (25608480)

I was responsible for developing the core administrative logic and essential user account functionalities. Below are the key modules I implemented:

### 1. Admin Management Dashboard
* **Full Dashboard UI:** Created the entire administrative interface for centralized control.
* **Live Search Functionality:** Built a real-time filtering system using React state, enabling admins to search users, orders, and products instantly.
* **Live User Cart Tracking:** Developed a module using SQL Joins to allow admins to monitor active shopping carts in real-time.

### 2. User Account & Profile Management
* **My Profile:** Built the profile page for users to view and update personal data like addresses and contact info.
* **Data Persistence:** Integrated frontend forms with MySQL to ensure user information is saved securely.

### 3. Shopping Cart & Inventory Logic
* **Persistent Cart:** Implemented the shopping cart system that saves items across different user sessions.
* **Dynamic Calculations:** Automated the calculation of subtotals and totals based on real-time price data.

### 4. Order Management & Transactional Checkout
* **Order History:** Developed the user-facing view for tracking past orders and delivery statuses.
* **Atomic Checkout Process:** Engineered a backend Database Transaction that:
    1. Validates the active cart.
    2. Transfers items from cart to orders and order_items.
    3. Resets the user's shopping cart upon successful payment.
* **Data Integrity:** Ensured price_at_purchase is recorded to prevent historical data errors if product prices change in the future.