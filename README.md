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
2. Open frontend terminal and Install dependencies: `npm install`.
3. Open backend terminal and Install dependencies:`npm install dotenv`.
4. Import `doki.sql` into your MySQL server.
5. Duplicate `.env.example` and rename it to `.env`.
6. Fill in your local MySQL password in the `.env` file.
7. Start backend: `node server.js`.
8. Start frontend: `npm run dev`.

---

## Student 1: Yu-Ching, WU (Student ID: 25729536)
* Focus: Full-Stack User Authentication, Customer-Facing Cart Subsystem, and Secure Checkout Loop.

**1. User Authentication & State Persistence (Requirement 1):** Engineered the client-side authentication workflow, implementing secure state persistence via stateless JWTs and localStorage tokens. Developed strict input validation (e.g., 10-digit phone tracking) and asynchronous error handling to eliminate UI crashes during login/registration failures.

**2. Intelligent Product Cart Subsystem:** Designed and optimized the customer-facing quantity controllers. Implemented dynamic live-subtotal calculations, stateless-to-stateful input tracking, and an advanced onBlur UX defense mechanism that instantly deletes items upon manual text clearance to match mainstream e-commerce behaviors.

**3. Session Security & UI Routing Integration:** Orchestrated the synchronization between the global application state and secure backend customer endpoints, ensuring cart tokens are validated in the request header upon every mutation.

## Files Implemented/Modified (Individual & Collaborative): 
* LoginModal.jsx, CartPage.jsx, CheckoutPage.jsx (Core Developer)
* App.jsx, Shop.jsx (Implemented front-end cart mutations, capsule quantity inputs, and global badge logic)
* App.css (Designed styles for modals, side-cart overlays, and responsive tables)

## Student 2: Jui-Yu, Chang (Student ID: 25608480)
* Focus: Relational Database Architecture, Real-Time Filtering Systems, and Admin Control Domain.

**1. Live Search Architecture & Inventory Filtering (Requirement 2):** Developed the optimized client-side product filtering engine, utilizing stateful React query changes to look up, match, and render product cards instantly as the user types.

**2. Admin Dashboard & Profile Management (Requirement 3):** Conceptualized and built the centralized administration interface, allowing authorized managers to execute structural CRUD operations on inventory and audit global user sessions via complex relational database queries.

**3. Database Infrastructure & Secure Back-End Configuration:** Constructed the relational doki.sql schemas, primary/foreign key mappings, and established the server-side .env configuration template (.env.example) to eliminate hardcoded credentials across all API endpoints.

## Files Implemented/Modified (Individual & Collaborative): 
* AdminDashboard.jsx, UserProfile.jsx, doki.sql (Core Developer)
* server.js (Architected Express routing, database connection pools, and JWT signing)
* Shop.jsx (Implemented product data grid layout and integrated live search query filters)

## Shared Project Infrastructure & Configuration 
Both team members paired up and collaborated equally on setting up the underlying environment and deployment files for this repository, including:
* Files: package.json, package-lock.json (Dependency management & script configurations)
* Files: .gitignore, .env.example (Environment masking and repository access security)
* Files: README.md (Project Instruction)

