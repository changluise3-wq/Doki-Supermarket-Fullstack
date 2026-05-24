// 引入 dotenv 套件，這行會自動讀取同資料夾底下的 .env 檔案內容
require('dotenv').config();

const express = require('express'); //Node.js 裡最知名、市佔率最高的「後端架構」。用來設定網址路由、處理前端傳來的資料、回傳資料給前端等。
const mysql = require('mysql2');
const cors = require('cors');   //跨來源資源共享安全通道，前後端分離專案的必備套件。允許跨網域請求的套件，讓前端 (5173) 可以連到後端 (3000)
const bodyParser = require('body-parser');  //接收前端表單或解析JSON 格式資料，讓我們在 req.body 裡面拿到前端送來的資料
const bcrypt = require('bcrypt');   //密碼加密套件
const jwt = require('jsonwebtoken'); //JSON Web Token 的縮寫，一種安全的用戶認證機制，讓我們可以在前端存一個「令牌」來識別使用者身份，並且在每次請求時帶上這個令牌驗證身份，取代傳統的 Session 機制。

const app = express();
// 從 .env 檔案讀取金鑰，如果讀不到就用預設的字串（保護安全性）
const SECRET_KEY = process.env.SECRET_KEY || "doki_supermarket_secret_2024"; //先看process.env.DB_HOST有沒有值沒有的話就用doki_...2024(||:或者 (OR)
const saltRounds = 10; // bcrypt 加密時使用的鹽碎輪數
// const SECRET_KEY = "doki_supermarket_secret_2024"; 
// const saltRounds = 10;

app.use(cors());// 允許跨網域請求 (讓前端 5173 可以連到後端 3000)
app.use(bodyParser.json()); // 解析前端傳來的 JSON 格式資料

// 使用 process.env 讀取 .env 檔裡面的變數，徹底解決硬編碼(寫死)密碼的問題！
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',          // 資料庫主機位置
    user: process.env.DB_USER || 'root',               // 資料庫使用者帳號
    password: process.env.DB_PASSWORD ?? '',           // 資料庫密碼（如果是空字串就用空字串）
    database: process.env.DB_NAME || 'doki_supermarket' // 要連線的資料庫名稱
});
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'beaniceperson2020', 
//     database: 'doki_supermarket'
// });

// 呼叫連線方法開始連接資料庫
db.connect(err => {
    if (err) {
        // 如果發生連線錯誤，在終端機印出英文錯誤訊息並中斷程式
        console.error('❌ Database connection failed. Please check if MySQL is running or password is correct:', err);
        throw err;
    }
    // 連線成功，印出帶有資料庫名稱的英文成功訊息
    console.log(`✅ MySQL Connected successfully to database: ${process.env.DB_NAME || 'doki_supermarket'}`);
});

// 開始連線到 MySQL 資料庫
// db.connect(err => {
//     if (err) throw err;
//     console.log('MySQL Connected & All Functions Integrated');
// });

// --- JWT 驗證中間件 ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token Required" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = decoded; 
        next();
    });
};

// ==========================================
// 1. 前台基礎功能 (保留原本邏輯)
// ==========================================

// [保留] 獲取所有產品 (用於 Live Search)
app.get('/api/products', (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// [升級] 登入 (加入 Token 回傳)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (results.length === 0) return res.status(401).json({ message: "User not found" });
        const user = results[0];
        if (user.status === 'suspended') return res.status(403).json({ message: "Account suspended." });
        
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
            res.json({ 
                success: true, 
                token, 
                user: { id: user.id, username: user.username, role: user.role, fullName: user.full_name, address: user.address, phone: user.phone } 
            });
        } else {
            res.status(401).json({ success: false, message: "Wrong password" });
        }
    });
});

// [保留] 註冊
app.post('/api/register', async (req, res) => {
    const { username, password, phone } = req.body;
    const hashed = await bcrypt.hash(password, saltRounds);
    db.query("INSERT INTO users (username, password, phone, role) VALUES (?, ?, ?, 'user')", [username, hashed, phone], (err) => {
        if (err) return res.status(400).json({ success: false, message: "Username exists" });
        res.json({ success: true });
    });
});

// [保留] 更新個人資料 (加入 Token 保護)
app.put('/api/user/profile/:id', authenticateToken, (req, res) => {
    const { fullName, address, phone } = req.body;
    // 確保使用者只能改自己的資料
    if (req.user.id != req.params.id) return res.status(403).send("Forbidden");
    db.query("UPDATE users SET full_name = ?, address = ?, phone = ? WHERE id = ?", [fullName, address, phone, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// ==========================================
// 2. 購物車與結帳 (三層架構升級)
// ==========================================
//【READ】 讀取特定用戶的購物車(帶 Token)
app.get('/api/cart', authenticateToken, (req, res) => {
    // 修正：確保欄位名稱與 doki.sql 一致
    const sql = "SELECT c.id, c.quantity, p.id as product_id, p.name, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?";
    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 【POST】 新增或更新數量 (帶 Token)
app.post('/api/cart', authenticateToken, (req, res) => {
    const { product_id, quantity } = req.body; // 解構前端傳來的商品編號與數量
    const userId = req.user.id; // 從 Token 保安那裡拿到解析出來的會員 ID

    // 查詢該用戶的購物車內是否已經有這件商品
    db.query("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [userId, product_id], (err, results) => {
        
        // ⚠️ 關鍵錯誤防護：如果 SQL 執行出錯，立刻印出並回傳錯誤，阻止程式崩潰！
        if (err) {
            console.error("❌ SQL Error in POST /api/cart:", err.sqlMessage || err);
            return res.status(500).json({ success: false, message: "Database query error" });
        }

        // 安全關卡通過後，此時的 results 必定百分之百存在，可以安心讀取 .length
        if (results && results.length > 0) {
            // 商品已存在於購物車中：累加數量
            db.query("UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?", [quantity, userId, product_id], (updateErr) => {
                if (updateErr) return res.status(500).json(updateErr);
                res.json({ success: true });
            });
        } else {
            // 商品不存在於購物車中：全新插入一筆紀錄
            db.query("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", [userId, product_id, quantity], (insertErr) => {
                if (insertErr) return res.status(500).json(insertErr);
                res.json({ success: true });
            });
        }
    });
});


// 使用者自行修改數量與刪除
app.put('/api/cart/:id', authenticateToken, (req, res) => {
    db.query("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?", [req.body.quantity, req.params.id, req.user.id], () => res.json({ success: true }));
});

app.delete('/api/cart/:id', authenticateToken, (req, res) => {
    db.query("DELETE FROM cart WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], () => res.json({ success: true }));
});

// 結帳搬移邏輯 (Transaction)
app.post('/api/checkout', authenticateToken, (req, res) => {
    const { notes } = req.body;
    const userId = req.user.id;

    db.beginTransaction((err) => {
        const sql = "SELECT c.*, p.name, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?";
        db.query(sql, [userId], (err, items) => {
            if (err || !items.length) return db.rollback(() => res.status(400).send("Cart is empty"));

            const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);

            // 1. 插入訂單主表
            db.query("INSERT INTO orders (user_id, total_price, notes) VALUES (?, ?, ?)", [userId, total, notes || ""], (err, result) => {
                if (err) return db.rollback(() => res.status(500).send("Orders Table Error"));
                
                const orderId = result.insertId;

                // 2. 關鍵：這裡必須傳入 5 個值，且順序要跟 SQL 一模一樣
                // 順序：order_id, product_id, product_name, price_at_purchase, quantity
                const vals = items.map(i => [orderId, i.product_id, i.name, i.price, i.quantity]);
                const itemSql = "INSERT INTO order_items (order_id, product_id, product_name, price_at_purchase, quantity) VALUES ?";
                
                db.query(itemSql, [vals], (err2) => {
                    if (err2) {
                        console.error(" SQL Error:", err2.sqlMessage); 
                        return db.rollback(() => res.status(500).send("Order Items Error: " + err2.sqlMessage));
                    }

                    // 3. 清空購物車
                    db.query("DELETE FROM cart WHERE user_id = ?", [userId], () => {
                        db.commit(() => res.json({ success: true, orderId }));
                    });
                });
            });
        });
    });
});

// ==========================================
// 3. 管理員功能 (保留所有原本功能並補強)
// ==========================================

// [保留] 獲取所有用戶 (CRM)
app.get('/api/admin/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Denied");
    db.query("SELECT id, username, role, full_name, address, phone, status FROM users", (err, results) => res.json(results));
});

// [保留] 修改用戶權限與狀態 (Manage)
app.put('/api/admin/users/:id/manage', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Denied");
    const { role, status } = req.body;
    db.query("UPDATE users SET role = ?, status = ? WHERE id = ?", [role, status, req.params.id], () => res.json({ success: true }));
});

// [保留] 手動建立管理員
app.post('/api/admin/create-admin', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Denied");
    
    // 只解構需要的欄位
    const { username, password } = req.body;
    
    try {
        const hashed = await bcrypt.hash(password, saltRounds);
        
        // 預設將 full_name 和 phone 給予空字串或 null
        const sql = "INSERT INTO users (username, password, full_name, phone, role) VALUES (?, ?, ?, ?, 'admin')";
        const values = [username, hashed, "", "", 'admin']; // fullName 和 phone 先給空值
        
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            res.json({ success: true });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// [新增] 監控全域購物車 (作業要求)
app.get('/api/admin/all-carts', authenticateToken, (req, res) => {
    // ⚠️ 關鍵修正：必須 JOIN products 才能拿到商品名稱 (name)
    const sql = `
        SELECT c.*, p.name, p.price 
        FROM cart c 
        JOIN products p ON c.product_id = p.id
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.get('/api/admin/orders', authenticateToken, (req, res) => {
    // ⚠️ 核心邏輯：除了抓取訂單主表，還要 JOIN order_items 撈出商品明細
    const sql = `
        SELECT 
            o.id AS order_id, o.user_id, o.total_price, o.status, o.notes, o.created_at,
            u.username,
            oi.id AS item_id, oi.product_name, oi.price_at_purchase, oi.quantity
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        ORDER BY o.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);

        // ⚠️ 關鍵：因為 JOIN 會產生多行重複的訂單資料，我們要在後端把相同 order_id 的商品打包成一個 items 陣列
        const ordersMap = {};
        results.forEach(row => {
            if (!ordersMap[row.order_id]) {
                ordersMap[row.order_id] = {
                    id: row.order_id,
                    user_id: row.user_id,
                    username: row.username,
                    total_price: row.total_price,
                    status: row.status,
                    notes: row.notes,
                    created_at: row.created_at,
                    items: [] // 用來放被購買的商品明細
                };
            }
            // 如果這條紀錄有包含商品細項，就塞進陣列裡
            if (row.item_id) {
                ordersMap[row.order_id].items.push({
                    id: row.item_id,
                    name: row.product_name, // 👈 對齊前端點閱需要的 item.name
                    price_at_purchase: row.price_at_purchase,
                    quantity: row.quantity
                });
            }
        });

        // 將物件轉回陣列格式回傳給前端
        res.json(Object.values(ordersMap));
    });
});

// [新增] 刪除用戶
app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Denied");
    db.query("DELETE FROM users WHERE id = ?", [req.params.id], () => res.json({ success: true }));
});

app.get('/api/admin/orders', authenticateToken, (req, res) => {
    db.query("SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.id", (err, r) => res.json(r));
});

app.listen(3000, () => console.log('Final Unified Server Running'));