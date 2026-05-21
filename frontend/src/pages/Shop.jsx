import React, { useState } from 'react';
import axios from 'axios';

function Shop({ cart, onUpdate, user, setIsLoginOpen }) {
  const [searchTerm, setSearchTerm] = useState(""); // 搜尋狀態
  
  // 原本的 10 項產品資料，補上 ID 以便與資料庫關聯
  const [products] = useState([
    { id: 1, name: "I-MEI chocolate puff", price: 3.99, img: "1-I-MEI chocolate puff.jpg" },
    { id: 2, name: "Taiwanese rice crisps snack", price: 3.99, img: "2-Taiwanese rice crisps snack.jpg" },
    { id: 3, name: "Instant Noodles", price: 5.99, img: "3-Instant Noodles.jpg" },
    { id: 4, name: "Mini Science Noodles", price: 3.89, img: "4-Science noodles.jpg" },
    { id: 5, name: "Matcha KitKat", price: 8.99, img: "5-Matcha KitKat.jpg" },
    { id: 6, name: "Choco Wafer Mini KitKat", price: 5.99, img: "6-Choco Wafer Mini KitKat.jpg" },
    { id: 7, name: "UHA Mochu", price: 2.99, img: "7-UHA Mochu.jpg" },
    { id: 8, name: "Glico Pocky Tasty Chocolate Biscuit Sticks", price: 5.99, img: "8-Glico Pocky Tasty Chocolate Biscuit Sticks.jpg" },
    { id: 9, name: "Calbee Potato Chips", price: 3.99, img: "9-Calbee Potato Chips.jpg" },
    { id: 10, name: "Lotte Sasha Rich Matcha Chocolate Crisps", price: 4.99, img: "10-Lotte Sasha Rich Matcha Chocolate Crisps.jpg" }
  ]);

  // Live Search 過濾邏輯
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- [新增/修改] 加入購物車 (帶 Token) ---
  // Shop.jsx 中的加入購物車功能
    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');
        if (!token) return setIsLoginOpen(true);

        try {
            // 呼叫 API 更新後端資料庫
            await axios.post("http://localhost:3000/api/cart", 
            { product_id: product.id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
            );
            // ⚠️ 重要：執行 App.jsx 傳下來的 fetchCart，讓右上角數字即時變動
            onUpdate(); 
        } catch (err) { console.error(err); }
    };

  // --- [新增/修改] 更新數量與刪除 (帶 Token) ---
  const updateQty = async (cartId, newQty) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      if (newQty <= 0) {
        // 呼叫刪除 API
        await axios.delete(`http://localhost:3000/api/cart/${cartId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // 呼叫更新數量 API
        await axios.put(`http://localhost:3000/api/cart/${cartId}`, 
          { quantity: newQty }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onUpdate();
    } catch (err) {
      console.error("Update quantity failed:", err);
    }
  };

  // --- [新增] 結帳功能 (帶 Token) ---
  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token || cart.length === 0) return;
    
    if (!window.confirm("Confirm checkout?")) return;

    try {
      await axios.post("http://localhost:3000/api/checkout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Order placed successfully!");
      onUpdate(); // 結帳後購物車會清空
    } catch (err) {
      alert("Checkout failed: " + (err.response?.data || "Server error"));
    }
  };

  return (
    <div className="container">
      <div className="products">
        <h2>New Products</h2>

        {/* 歡迎語區塊 */}
        {user && <p className="text-red welcome-banner">Welcome back, {user.username}!</p>}
        
        {/* 原本的搜尋框 */}
        <div className="search-container">
          <input 
            type="text" 
            className="search-input"
            placeholder="🔍 Search for snacks (e.g. KitKat)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 產品網格 */}
        <div className="product-grid">
          {filteredProducts.map((p) => {
            // 比對產品 ID 以找出購物車中的對應項
            const item = cart.find((i) => i.product_id === p.id);

            return (
              <div className="card" key={p.id}>
                <img src={`/pics/${p.img}`} alt={p.name} />
                <p className="bold-text">{p.name}</p>
                <p className="text-red">${p.price}</p>
                
                <div className="action-area">
                  {!item ? (
                    <button className="add-btn" onClick={() => handleAddToCart(p)}>
                      Add to Cart
                    </button>
                  ) : (
                    <div className="qty-control">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)} 
                      />
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                      {/* 新增刪除垃圾桶 */}
                      <button className="delete-icon-btn" onClick={() => updateQty(item.id, 0)}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 搜尋不到東西時的提示 */}
        {filteredProducts.length === 0 && (
          <div className="no-results">
            <p>No snacks matching <span className="text-red">"{searchTerm}"</span>.</p>
          </div>
        )}

        {/* 只有在購物車有東西時才顯示結帳按鈕 */}
        {cart.length > 0 && (
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
             <hr className="separator" />
             <button className="add-btn" style={{ maxWidth: '300px' }} onClick={handleCheckout}>
               Confirm Checkout
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;