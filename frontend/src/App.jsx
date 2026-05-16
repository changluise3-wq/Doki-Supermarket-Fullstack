import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Shop from './pages/Shop';
import AdminDashboard from './pages/AdminDashboard';
import LoginModal from './components/LoginModal';
import UserProfile from './pages/UserProfile';
import './App.css';

function App() {
  const [page, setPage] = useState('shop');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // 1. 獲取購物車資料
  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/cart");
      setCart(res.data);
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  };

  // 2. 獲取用戶最新狀態 (修正原本未定義的問題)
  const fetchUserStatus = async () => {
    if (!user) return;
    try {
      // 這裡通常是呼叫獲取個人資料的 API，暫時用來刷新前端 user 狀態
      const res = await axios.get(`http://localhost:3000/api/admin/users`);
      const currentUser = res.data.find(u => u.id === user.id);
      if (currentUser) setUser(currentUser);
    } catch (err) {
      console.error("Update user status error:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 3. 註冊邏輯 (修正: 接收 LoginModal 傳來的整個物件)
  const handleRegister = async (registrationData) => {
    try {
      const res = await axios.post("http://localhost:3000/api/register", registrationData);
      if (res.data.success) {
        alert("Registration successful! Please login.");
        setIsLoginOpen(false);
      }
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || "Server error"));
    }
  };

  // 4. 登入邏輯
  const handleLogin = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:3000/api/login", { username, password });
      if (res.data.success) {
        const loggedInUser = res.data.user;
        setUser(loggedInUser);
        setIsLoginOpen(false);
        // 管理員預設進後台，一般用戶留商店
        setPage(loggedInUser.role === 'admin' ? 'admin' : 'shop');
        console.log("前端傳來的資料:", { username, password });
        alert(`Welcome back, ${loggedInUser.username}!`);
      }
    } catch (err) {
      console.log("前端傳來的資料:", { username, password });
      alert("Login failed! Please check your credentials.");
    }
  };

  // 5. 登出邏輯
  const handleLogout = () => {
    setUser(null);
    setPage('shop');
    alert("Logged out.");
  };

  return (
    <div className="App">
      <header>
        <div className="header-top">
          <div className="logo-area">
            <h1>Do Do Do Doki 🍪</h1>
            <p>Taiwanese Grocery Store</p>
          </div>
          
          <div className="user-actions"> 
            {!user ? (
              <button className="nav-btn" onClick={() => setIsLoginOpen(true)}>Login</button>
            ) : (
              <>
                <span className="user-info-text">
                  Hi, {user.username} <span className="user-role-tag">({user.role})</span>
                </span>

                {/* 權限控制：管理員專屬切換鈕 */}
                {user.role === 'admin' && (
                  <div className="admin-toggle-group">
                    <button className={`nav-btn ${page === 'shop' ? 'active' : ''}`} onClick={() => setPage('shop')}>Shop View</button>
                    <button className={`nav-btn ${page === 'admin' ? 'active' : ''}`} onClick={() => setPage('admin')}>Admin Panel</button>
                  </div>
                )}

                <button className={`nav-btn ${page === 'profile' ? 'active' : ''}`} onClick={() => setPage('profile')}>My Profile</button>
                <button className="nav-btn ml-10" onClick={handleLogout}>Logout</button>
              </>
            )}

            {page === 'shop' && (
              <button className="nav-btn ml-10 badge-container">
                🛒 Cart
                <span className="badge">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
              </button>
            )}
          </div>
        </div>

        {page === 'shop' && (
          <nav>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#new">New Arrivals</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        )}
      </header>

      <main className="container">
        {/* 分頁路由邏輯 - 修正重複渲染問題 */}
        {page === 'profile' && user && <UserProfile user={user} onUpdate={fetchUserStatus} />}
        
        {page === 'admin' && (
          user?.role === 'admin' ? (
            <AdminDashboard user={user} />
          ) : (
            <div className="access-denied-container">
              <h2 className="access-denied-title">⚠️ Access Denied</h2>
              <p>You do not have permission to view this page.</p>
              <button className="add-btn" onClick={() => setPage('shop')}>Return to Shop</button>
            </div>
          )
        )}

        {page === 'shop' && <Shop cart={cart} onUpdate={fetchCart} user={user} />}
      </main>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLogin} 
        onRegister={handleRegister}
      />

      <footer>
         <p>&copy; 2026 Do Do Do Doki - Academic Project (Sydney)</p>
      </footer>
    </div>
  );
}

export default App;