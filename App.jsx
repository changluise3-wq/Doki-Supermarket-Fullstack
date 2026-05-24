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

  
  const fetchCart = async () => {
    
    const token = localStorage.getItem('token');
    
    if (!token) return setCart([]);
    try {
      
      const res = await axios.get("http://localhost:3000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCart(res.data);
    } catch (err) { console.error(err); }
  };



useEffect(() => {
  fetchCart();
}, [user]);

  
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

  
  const handleRegister = async (registrationData) => {
    try {
      const res = await axios.post("http://localhost:3000/api/register", registrationData);
      if (res.data.success) {
        alert("Registration successful! Please login.");
        
        // setIsLoginOpen(false);
      }
    } catch (err) {
      
      alert("Registration failed: " + (err.response?.data?.message || "Server error"));
      throw err; 
    }
  };

  
  const handleLogin = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:3000/api/login", { username, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setIsLoginOpen(false);
        if (res.data.user.role === 'admin') {
        setPage('admin'); 
        } else {
          setPage('shop');  
        }
      }
    } catch (err) { alert(err.response?.data?.message || "Login failed"); }
  };

  
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

                {/* --- admin button --- */}
                {user.role === 'admin' && (
                  <div className="admin-toggle-group">
                    {page === 'admin' ? (
                      <button className="nav-btn" onClick={() => setPage('shop')}>🛒 Back to Shop</button>
                    ) : (
                      <button className="nav-btn" onClick={() => setPage('admin')}>🛠️ Admin Dashboard</button>
                    )}
                  </div>
                )}

                {/* profile button */}
                {page !== 'admin' && (
                  <button className={`nav-btn ml-10 ${page === 'profile' ? 'active' : ''}`} onClick={() => setPage('profile')}>
                    My Profile
                  </button>
                )}
                
                <button className="nav-btn ml-10" onClick={handleLogout}>Logout</button>
              </>
            )}

            {/* --- cart  --- */}
            {page !== 'admin' && (
              <button className="nav-btn ml-10 badge-container" onClick={() => setIsCartOpen(true)}>
                🛒 Cart <span className="badge">{cart.reduce((sum, item) => sum + Number(item.quantity), 0)}</span>
              </button>
            )}
          </div>
        </div>

        {/* --- hoover --- */}
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
        {/* userProfile page */}
        {page === 'profile' && user && <UserProfile user={user} onUpdate={fetchUserStatus} />}
        {/* admin page */}
        {page === 'admin' && user?.role === 'admin' && (
          <AdminDashboard user={user} />
        )}
        {/* shop page */}
        {page === 'shop' && <Shop cart={cart} onUpdate={fetchCart} user={user} setIsLoginOpen={setIsLoginOpen}/>}
        
        {/* {page === 'cart' && <CartPage user={user} cart={cart} onUpdate={fetchCart} onClose={() => setPage('shop')}/>} */}
        {isCartOpen && (
          <CartPage 
            cart={cart} 
            onClose={() => setIsCartOpen(false)} 
            onUpdate={fetchCart} 
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
              setPage('shop');    
              fetchCart();        
              fetchUserStatus();  
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