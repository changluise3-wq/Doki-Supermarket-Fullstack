
CREATE DATABASE IF NOT EXISTS doki_supermarket;
USE doki_supermarket;

-- Drop old tables 
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Create users tables
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(10) NOT NULL,
    address VARCHAR(255) DEFAULT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL
);

-- Create cart table
-- User Carts > Detailed Cart Items > Checkout > Orders & Order Items
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create orders table
-- When Checkout is completed, we create an order record and move cart items to order_items
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'shipped') DEFAULT 'pending',
    notes TEXT DEFAULT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT DEFAULT NULL, -- allows NULL for historical record even if product is deleted later
    product_name VARCHAR(255) NOT NULL, -- record product name at time of purchase for history
    price_at_purchase DECIMAL(10, 2) NOT NULL, -- record price at time of purchase for history
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Account data
-- password:bcrypt.hash('123456', 10) => $2b$10$wAfPZaeG8cj7Epw1kcgmde8pZCyNPNAtsEJ1S2khANLbrIH9ytDai
INSERT INTO users (username, password, full_name, phone, address, role) VALUES 
('admin', '$2b$10$wAfPZaeG8cj7Epw1kcgmde8pZCyNPNAtsEJ1S2khANLbrIH9ytDai', 'Super Manager', '0412345678', 'Main Office, Sydney', 'admin'),
('staff_manager', '$2b$10$wAfPZaeG8cj7Epw1kcgmde8pZCyNPNAtsEJ1S2khANLbrIH9ytDai', 'David Chen', '0499888777', '456 Pitt St, Sydney, NSW', 'admin'),
('customer01', '$2b$10$wAfPZaeG8cj7Epw1kcgmde8pZCyNPNAtsEJ1S2khANLbrIH9ytDai', 'Alice Wang', '0412345678', '789 Broadway, Ultimo, NSW', 'user'),
('customer02', '$2b$10$wAfPZaeG8cj7Epw1kcgmde8pZCyNPNAtsEJ1S2khANLbrIH9ytDai', 'Bob Lee', '0400111222', '321 Kent St, Sydney, NSW', 'user'),
('lucky_star', '$2b$10$wAfPZaeG8cj7Epw1kcgmde8pZCyNPNAtsEJ1S2khANLbrIH9ytDai', 'Lucky Star', '0488777666', 'Sydney University, NSW', 'user')
ON DUPLICATE KEY UPDATE username=username;

-- Products data
INSERT INTO products (name, price) VALUES 
('I-MEI chocolate puff', 3.99), 
('Taiwanese rice crisps snack', 3.99),
('Instant Noodles', 5.99),
('Mini Science Noodles', 3.89),
('Matcha KitKat', 8.99),
('Choco Wafer Mini KitKat', 5.99),
('UHA Mochu', 2.99),
('Glico Pocky Tasty Chocolate Biscuit Sticks', 5.99),
('Calbee Potato Chips', 3.99),
('Lotte Sasha Rich Matcha Chocolate Crisps', 4.99)
ON DUPLICATE KEY UPDATE price = VALUES(price);