import React from 'react';
import axios from 'axios';

function CartPage({ cart, onClose, onUpdate, onCheckout }) {
  const token = localStorage.getItem('token');
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 1. 修改數量 API
  // CartPage.jsx
    const updateQuantity = async (cartId, newQty) => {
        if (newQty < 1) return; // 防呆：最少 1 件
        const token = localStorage.getItem('token');
        
        try {
            // 直接更新該筆購物車紀錄的數量
            await axios.put(`http://localhost:3000/api/cart/${cartId}`, 
            { quantity: newQty },
            { headers: { Authorization: `Bearer ${token}` } }
            );
            onUpdate(); // 同步 UI
        } catch (err) { console.error(err); }
    };

  // 2. 刪除品項 API
  const removeItem = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/cart/${id}`, headers);
      onUpdate(); // 刷新購物車
    } catch (err) { console.error(err); }
  };

  return (
    <div className="cart-overlay">
      <div className="cart-sidebar">
        <div className="cart-header">
          <h3>Your Shopping Cart</h3>
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <p className="empty-msg">Your cart is empty.</p>
          ) : (
            <table className="cart-table-mini">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <div className="qty-control">
                        <button className="qty-btn-vivid" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button className="qty-btn-vivid" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button className="del-icon-btn" onClick={() => removeItem(item.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="cart-footer">
          <div className="total-row">
            <span>Total:</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <button 
            className="checkout-btn-final" 
            disabled={cart.length === 0}
            onClick={onCheckout}
          >
            Checkout Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;