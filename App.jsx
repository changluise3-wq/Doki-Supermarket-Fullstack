import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Shop from './pages/Shop';
import AdminDashboard from './pages/AdminDashboard';
import LoginModal from './components/LoginModal';
import UserProfile from './pages/UserProfile';
import CartPage from './components/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import './App.css';

function App() {
  const [page, setPage] = useState('shop');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [cart, setCart] = useState([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 1. 獲取購物車 (自動帶 Token)
  const fetchCart = async () => {
    // 從瀏覽器的小口袋撈出之前存進去的通行證(Token)
    const token = localStorage.getItem('token');
    // 如果根本沒有通行證（沒登入），就直接把購物車設為空陣列，不向後端發請求
    if (!token) return setCart([]);
    try {
      // 發送請求給後端，並在 Headers 裡帶上 Bearer 通行證
      const res = await axios.get("http://localhost:3000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 將後端傳回來的該用戶購物車資料存入 React 狀態
      setCart(res.data);
    } catch (err) { console.error(err); }
  };


// 監聽 user 狀態，當登入或登出時，重新抓取該用戶的購物車
useEffect(() => {
  fetchCart();
}, [user]);

  // 2. 獲取用戶狀態 (用於 Profile 更新後同步)
  const fetchUserStatus = async () => {
    const token = localStorage.getItem('token');
    if (!user || !token) return;
    try {
      const res = await axios.get(`http://localhost:3000/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentUser = res.data.find(u => u.id === user.id);
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // 3. 註冊與登入邏輯 (保持不變)
  const handleRegister = async (registrationData) => {
    try {
      const res = await axios.post("http://localhost:3000/api/register", registrationData);
      if (res.data.success) {
        alert("Registration successful! Please login.");
        // if (onSuccess) onSuccess(); // 觸發前端 Modal 清空並切換畫面
        // setIsLoginOpen(false);
      }
    } catch (err) {
      // 只有當後端真的回傳失敗時，才彈出錯誤訊息
      alert("Registration failed: " + (err.response?.data?.message || "Server error"));
      throw err; // 👈 關鍵：把錯誤往外丟，讓 LoginModal 知道失敗了，不要清空表單
    }
  };

  // 4.登入 (存入 Token)
  const handleLogin = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:3000/api/login", { username, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setIsLoginOpen(false);
        if (res.data.user.role === 'admin') {
        setPage('admin'); // 管理員登入直接進管理後台
        } else {
          setPage('shop');  // 一般用戶進商店
        }
      }
    } catch (err) { alert(err.response?.data?.message || "Login failed"); }
  };

  // 5.登出
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCart([]);
    setPage('shop');
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
                <span className="user-info-text" style={{ fontWeight: '500', marginRight: '5px' }}>
                  Hi, {user.username}
                </span>

                {/* --- 管理員切換鈕 --- */}
                {user.role === 'admin' && (
                  <div className="admin-toggle-group">
                    {page === 'admin' ? (
                      <button className="nav-btn" onClick={() => setPage('shop')}>🛒 Back to Shop</button>
                    ) : (
                      <button className="nav-btn" onClick={() => setPage('admin')}>🛠️ Admin Dashboard</button>
                    )}
                  </div>
                )}

                {/* 非後台模式下才顯示個人資料按鈕 */}
                {page !== 'admin' && (
                  <button className={`nav-btn ml-10 ${page === 'profile' ? 'active' : ''}`} onClick={() => setPage('profile')}>
                    My Profile
                  </button>
                )}
                
                <button className="nav-btn ml-10" onClick={handleLogout}>Logout</button>
              </>
            )}

            {/* --- 只有在「非後台」頁面才顯示購物車 --- */}
            {page !== 'admin' && (
              <button className="nav-btn ml-10 badge-container" onClick={() => setIsCartOpen(true)}>
                🛒 Cart <span className="badge">{cart.reduce((sum, item) => sum + Number(item.quantity), 0)}</span>
              </button>
            )}
          </div>
        </div>

        {/* --- 只有在「非後台」頁面才顯示商店導覽列 --- */}
        {page !== 'admin' && (
          <nav>
            <ul>
              <li><button className="text-link" onClick={() => setPage('shop')}>Home</button></li>
              <li><a href="#new">New Arrivals</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        )}
      </header>

      <main className="container">
        {/* 個人資料頁面：負責編輯與顯示個人資訊 */}
        {page === 'profile' && user && <UserProfile user={user} onUpdate={fetchUserStatus} />}
        {/* 管理員頁面 */}
        {page === 'admin' && user?.role === 'admin' && (
          <AdminDashboard user={user} />
        )}
        {/* 商店頁面：負責產品與購物 */}
        {page === 'shop' && <Shop cart={cart} onUpdate={fetchCart} user={user} setIsLoginOpen={setIsLoginOpen}/>}
        
        {/* {page === 'cart' && <CartPage user={user} cart={cart} onUpdate={fetchCart} onClose={() => setPage('shop')}/>} */}
        {isCartOpen && (
          <CartPage 
            cart={cart} 
            onClose={() => setIsCartOpen(false)} 
            onUpdate={fetchCart} // ⚠️ 檢查這裡，必須叫 onUpdate 且傳入 fetchCart
            onCheckout={() => {
              setIsCartOpen(false);
              setPage('checkout');
            }}
          />
        )}
        {page === 'checkout' && (
          <CheckoutPage 
            cart={cart} 
            user={user} 
            onOrderComplete={() => {
              // alert("Order Placed Successfully!");
              setPage('shop');    // 1. 跳回商店
              fetchCart();        // 2. ⚠️ 關鍵：重新執行 API，抓取被後端刪除後的空購物車
              fetchUserStatus();  // 3. 同步用戶資料
            }}
          />
        )}
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