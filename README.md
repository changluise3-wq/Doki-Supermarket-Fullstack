# 🍪 Do Do Do Doki - Taiwanese Grocery E-Commerce

A full-stack e-commerce platform specializing in Taiwanese snacks and groceries. This project is built using **React (Vite)** for the frontend, **Node.js (Express)** for the backend, and **MySQL** for the database.

## Key Features
- **Shopping Experience**: Browse products, keyword search, and real-time shopping cart management.
- **Member System**: Secure registration and login with **Bcrypt** password hashing.
- **User Profile**: Update personal details including full name, address, and phone number.
- **Admin Dashboard**: Manage order statuses (Pending, Shipped, Cancelled) and control user permissions (Promote/Demote Admins).
- **Responsive Design**: Optimized for various screen sizes for a seamless shopping experience.

---

## Tech Stack
- **Frontend**: React.js, Vite, Axios, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0
- **Authentication**: Bcrypt.js (Password Hashing)

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **MySQL** (v8.0)
- **NPM** (comes with Node.js)

### 2. Database Setup
1. Create a database named `doki_supermarket` in your MySQL environment.
2. Import the `backend/doki.sql` file provided in this repository to set up tables and sample data.

### 3. Backend Setup
```bash
cd backend
npm install
node server.js