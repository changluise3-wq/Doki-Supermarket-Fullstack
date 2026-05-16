const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10; 

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL 連接配置
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'beaniceperson2020', //process.env.DB_PASSWORD || ''
    database: 'doki_supermarket'
});

db.connect(err => {
    if (err) {
        console.error('❌ database failed to connect:', err);
        throw err;
    }
    console.log('✅ MySQL Connected to doki_supermarket');
});

// ==========================================
// 1. 購物前台 API
// ==========================================
// 獲取所有產品
app.get('/api/products', (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 【READ】 讀取購物車
app.get('/api/cart', (req, res) => {
    db.query("SELECT * FROM cart", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 【POST】 新增或更新數量
app.post('/api/cart', (req, res) => {
    const { name, price } = req.body;
    const checkSql = "SELECT * FROM cart WHERE product_name = ?";
    db.query(checkSql, [name], (err, results) => {
        if (err) return res.status(500).json(err);
        
        if (results.length > 0) {
            db.query("UPDATE cart SET quantity = quantity + 1 WHERE product_name = ?", [name], (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Updated" });
            });
        } else {
            db.query("INSERT INTO cart (product_name, price, quantity) VALUES (?, ?, 1)", [name, price], (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Added" });
            });
        }
    });
});

// 【PUT】 依照 ID 更新數量
app.put('/api/cart/:id', (req, res) => {
    const { quantity } = req.body;
    const { id } = req.params;
    db.query("UPDATE cart SET quantity = ? WHERE id = ?", [quantity, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Quantity Updated" });
    });
});

// 【DELETE】 依照 ID 刪除
app.delete('/api/cart/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM cart WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Deleted" });
    });
});

// ==========================================
// 2. 身分驗證與個人資料 API
// ==========================================

// 登入
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log("嘗試登入帳號:", username); // 除錯用

    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length === 0) {
            console.log("找不到此使用者"); // 除錯用
            return res.status(401).json({ message: "User not found" });
        }
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        console.log("密碼比對結果:", match); // 除錯用

        if (match) {
            res.json({
                success: true,
                user: { 
                    id: user.id, 
                    username: user.username, 
                    role: user.role,
                    fullName: user.full_name,
                    address: user.address,
                    phone: user.phone
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Wrong password" });
        }
    });
});

// 註冊 (加密密碼)
app.post('/api/register', async (req, res) => {
    const { username, password, phone } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = "INSERT INTO users (username, password, phone, role) VALUES (?, ?, ?, 'user')";
        db.query(sql, [username, hashedPassword, phone], (err) => {
            if (err) return res.status(400).json({ success: false, message: "Username exists or DB error" });
            res.json({ success: true, message: "Registered!" });
        });
    } catch (e) { res.status(500).send("Error"); }
});

// 更新個人資料
app.put('/api/user/profile/:id', (req, res) => {
    const { id } = req.params;
    const { fullName, address, phone } = req.body;
    const sql = "UPDATE users SET full_name = ?, address = ?, phone = ? WHERE id = ?";
    db.query(sql, [fullName, address, phone, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Profile updated!" });
    });
});

// ==========================================
// 3. 管理員後台專用 API
// ==========================================

// 獲取所有訂單 (用於後台 Orders 分頁)
app.get('/api/admin/orders', (req, res) => {
    db.query("SELECT * FROM cart", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 獲取所有用戶清單 (用於後台 CRM 與 Admin Team 分頁)
app.get('/api/admin/users', (req, res) => {
    // 重要：必須抓取全名、地址、電話，CRM 才能顯示資料
    const sql = "SELECT id, username, role, full_name, address, phone FROM users";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

// 修改用戶權限 (方法 B: 升級/降級)
app.put('/api/admin/users/:id/role', (req, res) => {
    const { id } = req.params;
    const { newRole } = req.body;

    if (!['admin', 'user'].includes(newRole)) {
        return res.status(400).json({ error: "Invalid role type" });
    }

    const sql = "UPDATE users SET role = ? WHERE id = ?";
    db.query(sql, [newRole, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ success: true, message: "User role updated successfully" });
    });
});

// 手動建立管理員 (方法 A: 加密密碼)
app.post('/api/admin/create-admin', async (req, res) => {
    const { username, password, fullName, phone } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = "INSERT INTO users (username, password, full_name, phone, role) VALUES (?, ?, ?, ?, 'admin')";
        db.query(sql, [username, hashedPassword, fullName, phone], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: "Admin username already exists" });
                }
                return res.status(500).json({ error: "Creation failed" });
            }
            res.json({ success: true, message: "New admin created successfully!" });
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));