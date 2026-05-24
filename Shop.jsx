import React, { useState } from 'react';
import axios from 'axios';

function Shop({ cart, onUpdate, user, setIsLoginOpen }) {
  const [searchTerm, setSearchTerm] = useState(""); 
  
  
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

  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  
    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');  
        if (!token) return setIsLoginOpen(true);    

        try {
            
            await axios.post("http://localhost:3000/api/cart", 
            { product_id: product.id, quantity: 1 },  
            { headers: { Authorization: `Bearer ${token}` } } 
            );
            
            onUpdate(); 
        } catch (err) { console.error(err); }
    };

  
  const updateQty = async (cartId, newQty) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      if (newQty <= 0) {
        
        await axios.delete(`http://localhost:3000/api/cart/${cartId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        
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

  
  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token || cart.length === 0) return;
    
    if (!window.confirm("Confirm checkout?")) return;

    try {
      await axios.post("http://localhost:3000/api/checkout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Order placed successfully!");
      onUpdate(); 
    } catch (err) {
      alert("Checkout failed: " + (err.response?.data || "Server error"));
    }
  };

  return (
    <div className="container">
      <div className="products">
        <h2>New Products</h2>

        {user && <p className="text-red welcome-banner">Welcome back, {user.username}!</p>}
        
        {/* search box */}
        <div className="search-container">
          <input 
            type="text" 
            className="search-input"
            placeholder="🔍 Search for snacks (e.g. KitKat)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* product grid */}
        <div className="product-grid">
          {filteredProducts.map((p) => {
            
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
                        
                        value={item.quantity === 0 ? "" : item.quantity}                       
                          
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            
                            updateQty(item.id, 0);
                          } else {
                            const parsed = parseInt(val);
                            
                            if (parsed > 0) {                            
                              updateQty(item.id, val);
                            }
                          }
                        }}
                        
                        onBlur={() => {
                          
                          
                          if (item.quantity <= 0) {
                            updateQty(item.id, 0);
                          }
                        }}
                      />
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                    </div>  
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* no results message */}
        {filteredProducts.length === 0 && (
          <div className="no-results">
            <p>No snacks matching <span className="text-red">"{searchTerm}"</span>.</p>
          </div>
        )}      

        {/* checkout button */}
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