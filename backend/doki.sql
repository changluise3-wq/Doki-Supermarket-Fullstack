-- 1. 建立並切換資料庫
CREATE DATABASE IF NOT EXISTS doki_supermarket;
USE doki_supermarket;

-- 2. 【安全重置】 依照關聯順序刪除舊表
-- 必須先刪除有 FOREIGN KEY 的 cart 表，才能刪除 users 表
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- 3. 建立用戶表 (管理員與一般用戶)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,     -- UNIQUE 確保帳號不重複
    password VARCHAR(255) NOT NULL,            -- 儲存 bcrypt 加密後的亂碼
    full_name VARCHAR(100) DEFAULT NULL,       -- 客戶姓名
    phone VARCHAR(10) NOT NULL,                -- 電話限制 10 碼
    address VARCHAR(255) DEFAULT NULL,         -- 地址
    role ENUM('user', 'admin') DEFAULT 'user', -- 區分身分
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 紀錄註冊時間
);

-- 4. 建立商品表
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL
);

-- 5. 建立購物車/訂單監測表
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT DEFAULT 1,
    user_id INT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CREATE cartItem

-- 6. 預填測試資料 (5 筆用戶資料，密碼皆為 123456)
-- 密碼字串為 bcrypt.hash('123456', 10) 的結果
INSERT INTO users (username, password, full_name, phone, address, role) VALUES 
('admin', '$2b$10$XmS.V3f0Rj8R7T.t6yP5Iu8jN6Vw9gX4pLqY.rE5W1u8g6M2k5yS.', 'Super Manager', '0412345678', 'Main Office, Sydney', 'admin'),
('staff_manager', '$2b$10$XmS.V3f0Rj8R7T.t6yP5Iu8jN6Vw9gX4pLqY.rE5W1u8g6M2k5yS.', 'David Chen', '0499888777', '456 Pitt St, Sydney, NSW', 'admin'),
('customer01', '$2b$10$XmS.V3f0Rj8R7T.t6yP5Iu8jN6Vw9gX4pLqY.rE5W1u8g6M2k5yS.', 'Alice Wang', '0412345678', '789 Broadway, Ultimo, NSW', 'user'),
('customer02', '$2b$10$XmS.V3f0Rj8R7T.t6yP5Iu8jN6Vw9gX4pLqY.rE5W1u8g6M2k5yS.', 'Bob Lee', '0400111222', '321 Kent St, Sydney, NSW', 'user'),
('lucky_star', '$2b$10$XmS.V3f0Rj8R7T.t6yP5Iu8jN6Vw9gX4pLqY.rE5W1u8g6M2k5yS.', 'Lucky Star', '0488777666', 'Sydney University, NSW', 'user')
ON DUPLICATE KEY UPDATE username=username;

-- 7. 預填商品資料
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