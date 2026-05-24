
require('dotenv').config();

const express = require('express'); 
const mysql = require('mysql2');
const cors = require('cors');   
const bodyParser = require('body-parser');  
const bcrypt = require('bcrypt');   
const jwt = require('jsonwebtoken'); 

const app = express();

const SECRET_KEY = process.env.SECRET_KEY || "doki_supermarket_secret_2024"; 
const saltRounds = 10; 
// const SECRET_KEY = "doki_supermarket_secret_2024"; 
// const saltRounds = 10;

app.use(cors());
app.use(bodyParser.json()); 


const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',          
    user: process.env.DB_USER || 'root',               
    password: process.env.DB_PASSWORD ?? '',           
    database: process.env.DB_NAME || 'doki_supermarket' 
});
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'beaniceperson2020', 
//     database: 'doki_supermarket'
// });


db.connect(err => {
    if (err) {
        
        console.error('❌ Database connection failed. Please check if MySQL is running or password is correct:', err);
        throw err;
    }
    
    console.log(`✅ MySQL Connected successfully to database: ${process.env.DB_NAME || 'doki_supermarket'}`);
});


// db.connect(err => {
//     if (err) throw err;
//     console.log('MySQL Connected & All Functions Integrated');
// });


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

// ==========================================


app.get('/api/products', (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


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


app.post('/api/register', async (req, res) => {
    const { username, password, phone } = req.body;
    const hashed = await bcrypt.hash(password, saltRounds);
    db.query("INSERT INTO users (username, password, phone, role) VALUES (?, ?, ?, 'user')", [username, hashed, phone], (err) => {
        if (err) return res.status(400).json({ success: false, message: "Username exists" });
        res.json({ success: true });
    });
});


app.put('/api/user/profile/:id', authenticateToken, (req, res) => {
    const { fullName, address, phone } = req.body;
    
    if (req.user.id != req.params.id) return res.status(403).send("Forbidden");
    db.query("UPDATE users SET full_name = ?, address = ?, phone = ? WHERE id = ?", [fullName, address, phone, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// ==========================================

// ==========================================

app.get('/api/cart', authenticateToken, (req, res) => {
    
    const sql = "SELECT c.id, c.quantity, p.id as product_id, p.name, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?";
    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


app.post('/api/cart', authenticateToken, (req, res) => {
    const { product_id, quantity } = req.body; 
    const userId = req.user.id; 

    
    db.query("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [userId, product_id], (err, results) => {
        
        
        if (err) {
            console.error("❌ SQL Error in POST /api/cart:", err.sqlMessage || err);
            return res.status(500).json({ success: false, message: "Database query error" });
        }

        
        if (results && results.length > 0) {
            
            db.query("UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?", [quantity, userId, product_id], (updateErr) => {
                if (updateErr) return res.status(500).json(updateErr);
                res.json({ success: true });
            });
        } else {
            
            db.query("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", [userId, product_id, quantity], (insertErr) => {
                if (insertErr) return res.status(500).json(insertErr);
                res.json({ success: true });
            });
        }
    });
});



app.put('/api/cart/:id', authenticateToken, (req, res) => {
    db.query("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?", [req.body.quantity, req.params.id, req.user.id], () => res.json({ success: true }));
});

app.delete('/api/cart/:id', authenticateToken, (req, res) => {
    db.query("DELETE FROM cart WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], () => res.json({ success: true }));
});


app.post('/api/checkout', authenticateToken, (req, res) => {
    const { notes } = req.body;
    const userId = req.user.id;

    db.beginTransaction((err) => {
        const sql = "SELECT c.*, p.name, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?";
        db.query(sql, [userId], (err, items) => {
            if (err || !items.length) return db.rollback(() => res.status(400).send("Cart is empty"));

            const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);

            
            db.query("INSERT INTO orders (user_id, total_price, notes) VALUES (?, ?, ?)", [userId, total, notes || ""], (err, result) => {
                if (err) return db.rollback(() => res.status(500).send("Orders Table Error"));
                
                const orderId = result.insertId;

                
                
                const vals = items.map(i => [orderId, i.product_id, i.name, i.price, i.quantity]);
                const itemSql = "INSERT INTO order_items (order_id, product_id, product_name, price_at_purchase, quantity) VALUES ?";
                
                db.query(itemSql, [vals], (err2) => {
                    if (err2) {
                        console.error(" SQL Error:", err2.sqlMessage); 
                        return db.rollback(() => res.status(500).send("Order Items Error: " + err2.sqlMessage));
                    }

                    
                    db.query("DELETE FROM cart WHERE user_id = ?", [userId], () => {
                        db.commit(() => res.json({ success: true, orderId }));
                    });
                });
            });
        });
    });
});

// ==========================================

// ==========================================


app.get('/api/admin/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Denied");
    db.query("SELECT id, username, role, full_name, address, phone, status FROM users", (err, results) => res.json(results));
});


app.put('/api/admin/users/:id/manage', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Denied");
    const { role, status } = req.body;
    db.query("UPDATE users SET role = ?, status = ? WHERE id = ?", [role, status, req.params.id], () => res.json({ success: true }));
});


app.post('/api/admin/create-admin', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Denied");
    
    
    const { username, password } = req.body;
    
    try {
        const hashed = await bcrypt.hash(password, saltRounds);
        
        
        const sql = "INSERT INTO users (username, password, full_name, phone, role) VALUES (?, ?, ?, ?, 'admin')";
        const values = [username, hashed, "", "", 'admin']; 
        
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


app.get('/api/admin/all-carts', authenticateToken, (req, res) => {
    
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
                    items: [] 
                };
            }
            
            if (row.item_id) {
                ordersMap[row.order_id].items.push({
                    id: row.item_id,
                    name: row.product_name, 
                    price_at_purchase: row.price_at_purchase,
                    quantity: row.quantity
                });
            }
        });

        
        res.json(Object.values(ordersMap));
    });
});


app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Denied");
    db.query("DELETE FROM users WHERE id = ?", [req.params.id], () => res.json({ success: true }));
});

app.get('/api/admin/orders', authenticateToken, (req, res) => {
    db.query("SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.id", (err, r) => res.json(r));
});

app.listen(3000, () => console.log('Final Unified Server Running'));