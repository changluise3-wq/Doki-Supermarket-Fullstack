import React from 'react';
import axios from 'axios';

function CheckoutPage({ cart, user, onOrderComplete }) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

 
  // CheckoutPage.jsx 
const handlePlaceOrder = async () => {
  const token = localStorage.getItem('token');
  try {
    // 修正：這裡必須是 /api/checkout
    const res = await axios.post("http://localhost:3000/api/checkout", 
      { notes: "Customer final order" }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      alert("Order Successful! Cart Cleared.");
      onOrderComplete(); // 回到 App.jsx 觸發 fetchCart 歸零
    }
  } catch (err) {
    // 顯示具體錯誤，如果是 404 代表後端路由沒設好
    alert("Checkout Error: " + (err.response?.status || "Connection Error"));
    console.error(err);
  }
};


  return (
    <div className="checkout-container card" style={{ padding: '40px', maxWidth: '600px', margin: '20px auto', backgroundColor: 'white' }}>
      <h2 style={{ textAlign: 'center' }}>Checkout Confirmation</h2>
      <div className="shipping-info">
        <p><strong>Recipient:</strong> {user?.fullName || user?.username}</p>
        <p><strong>Address:</strong> {user?.address || "Please set in profile"}</p>
      </div>
      <hr />
      <div className="items-list">
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <h3 style={{ textAlign: 'right', marginTop: '20px' }}>Total: ${total.toFixed(2)}</h3>
      <button className="btn-edit-blue" style={{ width: '100%', marginTop: '20px' }} onClick={handlePlaceOrder}>
        Place Order Now
      </button>
    </div>
  );
}

export default CheckoutPage;