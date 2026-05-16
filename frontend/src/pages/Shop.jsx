import React, { useState } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:3000/api/cart";

function Shop({ cart, onUpdate, user }) {
  const [searchTerm, setSearchTerm] = useState(""); // 搜尋關鍵字狀態
  const [isEditing, setIsEditing] = useState(false); // 是否正在編輯個人資料
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    address: user?.address || "",
    phone: user?.phone || ""
  }); // 個人資料狀態
  // 完全保留原本的 10 項產品資料
  const [products] = useState([
    { name: "I-MEI chocolate puff", price: 3.99, img: "1-I-MEI chocolate puff.jpg" },
    { name: "Taiwanese rice crisps snack", price: 3.99, img: "2-Taiwanese rice crisps snack.jpg" },
    { name: "Instant Noodles", price: 5.99, img: "3-Instant Noodles.jpg" },
    { name: "Mini Science Noodles", price: 3.89, img: "4-Science noodles.jpg" },
    { name: "Matcha KitKat", price: 8.99, img: "5-Matcha KitKat.jpg" },
    { name: "Choco Wafer Mini KitKat", price: 5.99, img: "6-Choco Wafer Mini KitKat.jpg" },
    { name: "UHA Mochu", price: 2.99, img: "7-UHA Mochu.jpg" },
    { name: "Glico Pocky Tasty Chocolate Biscuit Sticks", price: 5.99, img: "8-Glico Pocky Tasty Chocolate Biscuit Sticks.jpg" },
    { name: "Calbee Potato Chips", price: 3.99, img: "9-Calbee Potato Chips.jpg" },
    { name: "Lotte Sasha Rich Matcha Chocolate Crisps", price: 4.99, img: "10-Lotte Sasha Rich Matcha Chocolate Crisps.jpg" }
  ]);

  // 即時過濾產品 
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = async (name, price) => {
    try {
      await axios.post(API_URL, { name, price });
      onUpdate(); // 更新 App.jsx 的購物車狀態
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  const updateQty = async (id, newQty) => {
    try {
      if (newQty <= 0) {
        await axios.delete(`${API_URL}/${id}`);
      } else {
        await axios.put(`${API_URL}/${id}`, { quantity: newQty });
      }
      onUpdate(); // 更新 App.jsx 的購物車狀態
    } catch (err) {
      console.error("Update quantity failed:", err);
    }
  };

  // 點擊儲存
  const handleSaveProfile = async () => {
    try {
      await axios.put(`http://localhost:3000/api/user/profile/${user.id}`, profile);
      alert("Profile updated!");
      setIsEditing(false);
      // 建議這裡要呼叫一個父組件的 function 來刷新 user 狀態
    } catch (err) { alert("Update failed"); }
  };

  return (
    <div className="container">
      {/* 這一層完全還原原本 HTML 的結構 */}
      <div className="products">
        <h2>New Products</h2>

        {/* 如果有登入，可以顯示一下歡迎語（這也是一種 UI 優化） */}
        {user && <p style={{color: '#e74c3c'}}>Welcome back, {user.username}!</p>}
        
        <div className="search-container">
          <input 
            type="text" 
            placeholder="🔍 Search for snacks (e.g. KitKat)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      

        <div className="product-grid">
          {filteredProducts.map((p) => {
            const item = cart.find((i) => i.product_name === p.name);

            return (
              <div className="card" key={p.name} data-name={p.name}>
                {/* 圖片路徑指向 public/pics/ */}
                <img src={`/pics/${p.img}`} alt={p.name} width="200" />
                <p>{p.name}</p>
                <p>${p.price}</p>
                
                <div className="action-area">
                  {!item ? (
                    // 顯示 Add to Cart 按鈕 (對應原本的 .add-btn)
                    <button 
                      className="add-btn" 
                      onClick={() => addToCart(p.name, p.price)}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    // 顯示數量控制器 (對應原本的 .qty-control)
                    <div className="qty-control">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        readOnly 
                      />
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
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
            <p>Sorry, we couldn't find any snacks matching 
                <span className="search-keyword"> "{searchTerm}"</span>.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Shop;