import React from 'react';
import axios from 'axios';

function CartPage({ cart, onClose, onUpdate, onCheckout }) {
  const token = localStorage.getItem('token');
  const headers = { headers: { Authorization: `Bearer ${token}` } };
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  
    const updateQuantity = async (cartId, newQty) => {
      
      if (newQty < 0) return; 

        const token = localStorage.getItem('token');
        try {
            
            await axios.put(`http://localhost:3000/api/cart/${cartId}`, 
            { quantity: newQty },
            { headers: { Authorization: `Bearer ${token}` } }
            );
            onUpdate(); 
        } catch (err) { 
          console.error(err); 
        }
      };

  
  const removeItem = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/cart/${id}`, headers);
      onUpdate(); 
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
                        style={{ width: '50px', textAlign: 'center', margin: '0 5px' }} 
                        // let the input be empty when quantity is 0 to allow user to type new number
                        value={item.quantity === 0 ? "" : item.quantity} 

                        // handle change immediately to allow fast updates, but also handle blur to prevent invalid state
                        onChange={(e) => {
                          const val = e.target.value;

                          
                          if (val === "") {                            
                            updateQuantity(item.id, 0);
                            } else {
                              // only allow positive integers
                              const parsed = parseInt(val);
                              
                              if (parsed > 0) {
                                updateQuantity(item.id, parsed);
                              }
                            }
                        }}               
                        onBlur={() => {
                          
                          if (item.quantity <= 0) {
                            updateQuantity(item.id, 1);
                          }
                        }}
                      />
                    
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </td>
                    {/* subtotal = price * quantity */}
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
