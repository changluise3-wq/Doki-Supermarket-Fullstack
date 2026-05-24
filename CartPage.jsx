import React from 'react';
import axios from 'axios';

function CartPage({ cart, onClose, onUpdate, onCheckout }) {
  const token = localStorage.getItem('token');
  const headers = { headers: { Authorization: `Bearer ${token}` } };
  //算總金額
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 1. 修改數量 API
    const updateQuantity = async (cartId, newQty) => {
      // 💡 調整防呆：允許 0 通過（因為打字刪光時需要狀態先變 0，畫面的字才刪得掉）
      if (newQty < 0) return; 

        const token = localStorage.getItem('token');
        try {
            // 直接更新該筆購物車紀錄的數量
            await axios.put(`http://localhost:3000/api/cart/${cartId}`, 
            { quantity: newQty },
            { headers: { Authorization: `Bearer ${token}` } }
            );
            onUpdate(); // 💡 關鍵：通知 App.jsx 重新 fetchCart()，這樣右上角的總數 Badge 與總金額才會同步更新！
        } catch (err) { 
          console.error(err); 
        }
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
            <p className="empty-msg"> Cart is empty.</p>
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
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>                        
                      <input 
                        type="number" 
                        style={{ width: '50px', textAlign: 'center', margin: '0 5px' }} // 置中微調
                        value={item.quantity === 0 ? "" : item.quantity} // 💡 關鍵：如果是 0 就顯示空，讓退格鍵能刪乾淨
                        onChange={(e) => {
                          const val = e.target.value;

                          // 當用戶用 Backspace 刪光字時，先讓它在前端和資料庫變 0，釋放鎖定
                          if (val === "") {                            
                            updateQuantity(item.id, 0);
                            } else {
                              const parsed = parseInt(val);
                              // 只有輸入正整數時才觸發即時更新
                              if (parsed > 0) {
                                updateQuantity(item.id, parsed);
                              }
                            }
                        }}               
                        onBlur={() => {
                          // 💡 離焦防呆：打完字滑鼠點到旁邊後，如果是空白或 0，自動校正回 1
                          if (item.quantity <= 0) {
                            updateQuantity(item.id, 1);
                          }
                        }}
                      />
                      
                      {/* 加號按鈕 */}
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button className="del-icon-btn" onClick={() => removeItem(item.id)}>❌</button>
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