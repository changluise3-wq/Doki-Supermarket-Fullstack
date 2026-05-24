-- 1. 建立並切換資料庫
CREATE DATABASE IF NOT EXISTS doki_supermarket;
USE doki_supermarket;

-- 2. 依照關聯順序刪除舊表
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- 3. 建立用戶表
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

-- 4. 建立商品表
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL
);

-- 5. 購物車表 (這是暫存區)
-- 後台 User Carts > Detail 就是查這張表
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. 訂單主表 (結帳後的正式紀錄)
-- Checkout 成功後會在此新增一筆
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'shipped') DEFAULT 'pending',
    notes TEXT DEFAULT NULL, -- 增加備註欄位供管理員查閱
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. 訂單細項 (永久儲存結帳當下的商品狀態)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT DEFAULT NULL, -- 保留商品連結
    product_name VARCHAR(255) NOT NULL, -- 即使商品被刪除，這裡的名字也會留著
    price_at_purchase DECIMAL(10, 2) NOT NULL, -- 紀錄購買當下的價格
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 8. 預填測試資料 (5 筆用戶資料，密碼皆為 123456)
-- 密碼字串為 bcrypt.hash('123456', 10) 的結果
INSERT INTO users (username, password, full_name, phone, address, role) VALUES 
('admin', '$2b$10$wAfPZaeG8cj7Epw1kcgmde8pZCyNPNAtsEJ1S2khANLbrIH9ytDai', 'Super Manager', '0412345678', 'Main Office, Sydney', 'admin'),
('staff_manager', '$2b$10$wAfPZaeG8cj7Epw1kcgmde8pZCyNPNAtsEJ1S2khANLbrIH9ytDai', 'David Chen', '0499888777', '456 Pitt St, Sydney, NSW', 'admin'),
('customer01', '$2b$10$wAfPZaeG8cj7Epw1kcgmde8pZCyNPNAtsEJ1S2khANLbrIH9ytDai', 'Alice Wang', '0412345678', '789 Broadway, Ultimo, NSW', 'user'),
('customer02', '$2b$10$wAfPZaeG8cj7Epw1kcgmde8pZCyNPNAtsEJ1S2khANLbrIH9ytDai', 'Bob Lee', '0400111222', '321 Kent St, Sydney, NSW', 'user'),
('lucky_star', '$2b$10$wAfPZaeG8cj7Epw1kcgmde8pZCyNPNAtsEJ1S2khANLbrIH9ytDai', 'Lucky Star', '0488777666', 'Sydney University, NSW', 'user')
ON DUPLICATE KEY UPDATE username=username;

-- 9. 預填商品資料
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