import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard({ user }) {
  const [adminView, setAdminView] = useState('user-carts'); 
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allUserCarts, setAllUserCarts] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [loading, setLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  const [detailItem, setDetailItem] = useState(null); 
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: "", message: "", onConfirm: null, isDanger: false
  });

  const token = localStorage.getItem('token'); 

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const [uRes, oRes, cRes] = await Promise.all([
        axios.get("http://localhost:3000/api/admin/users", headers),
        axios.get("http://localhost:3000/api/admin/orders", headers),
        axios.get("http://localhost:3000/api/admin/all-carts", headers)
      ]);
      setCustomers(uRes.data); 
      setOrders(oRes.data); 
      setAllUserCarts(cRes.data);
    } catch (err) { 
      console.error("Fetch error", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [adminView]);

  // --- 搜尋過濾 ---
  const filteredCartUsers = customers.filter(c => c.username.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOrders = orders.filter(o => o.username.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toString().includes(searchTerm));
  const filteredCustomers = customers.filter(c => c.role === 'user' && c.username.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredAdmins = customers.filter(c => c.role === 'admin' && c.username.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- API 函式 ---
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await axios.post("http://localhost:3000/api/admin/create-admin", 
        { username: newAdmin.username, password: newAdmin.password }, 
        config 
      );
      if (res.data.success) {
        setIsAddModalOpen(false);
        setNewAdmin({ username: '', password: '' });
        fetchData(); 
      }
    } catch (err) { 
      console.error("Create Admin Failed", err);
      alert("Create Failed: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const updateAccount = (id, data) => {
    axios.put(`http://localhost:3000/api/admin/users/${id}/manage`, data, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { setEditingItem(null); fetchData(); });
  };

  const updateOrder = (orderId, data) => {
    axios.put(`http://localhost:3000/api/admin/orders/${orderId}`, data, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchData());
  };

  const updateCartQty = (cartId, quantity) => {
    if (quantity < 1) return;
    axios.put(`http://localhost:3000/api/cart/${cartId}`, { quantity }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchData());
  };

  const triggerDelete = (type, id, name) => {
    let url;
    if (type === 'order') url = `http://localhost:3000/api/admin/orders/${id}`;
    if (type === 'user') url = `http://localhost:3000/api/admin/users/${id}`;
    if (type === 'cart-item') url = `http://localhost:3000/api/cart/${id}`;
    if (type === 'clear-cart') url = `http://localhost:3000/api/admin/users/${id}/clear-cart`;

    setConfirmModal({
      isOpen: true,
      title: "Confirm Delete",
      message: `Are you sure you want to remove ${name}?`,
      onConfirm: () => axios.delete(url, { headers: { Authorization: `Bearer ${token}` } }),
      isDanger: true
    });
  };

  const executeConfirm = async () => {
    if (confirmModal.onConfirm) {
        try {
          await confirmModal.onConfirm();
          setConfirmModal({ ...confirmModal, isOpen: false });
          setDetailItem(null);
          fetchData(); 
        } catch (err) {
          console.error("Delete Action Failed", err);
        }
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-title-section"><h2 className="admin-main-title">Admin Management Dashboard</h2></div>
      <div className="admin-search-section">
        <input className="admin-search-bar" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="admin-nav-tabs-centered">
        <button className={adminView === 'user-carts' ? 'active' : ''} onClick={() => setAdminView('user-carts')}>User Carts</button>
        <button className={adminView === 'orders' ? 'active' : ''} onClick={() => setAdminView('orders')}>Orders</button>
        <button className={adminView === 'customers' ? 'active' : ''} onClick={() => setAdminView('customers')}>Customers</button>
        <button className={adminView === 'admin-list' ? 'active' : ''} onClick={() => setAdminView('admin-list')}>Admin Team</button>
      </div>

      <section className="card admin-table-card">
        <div className="table-header-row">
            <h3 className="table-sub-title">{adminView.toUpperCase()}</h3>
            {adminView === 'admin-list' && <button className="add-btn-normal" onClick={() => setIsAddModalOpen(true)}>Register New Admin</button>}
        </div>

        <div className="table-wrapper-scroll">
          <table className="admin-full-table">
            {adminView === 'user-carts' && (
              <>
                <thead><tr><th>User ID</th><th>Username</th><th>Action</th></tr></thead>
                <tbody>
                  {filteredCartUsers.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td><td>{c.username}</td>
                      <td>
                        <button 
                          className="btn-edit-blue" 
                          onClick={async () => {
                              await fetchData(); 
                              setDetailItem({ type: 'cart', user: c });
                        }}>Detail</button>
                        <button className="btn-delete-red" onClick={() => triggerDelete('clear-cart', c.id, `${c.username}'s whole cart`)}>Clear</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {adminView === 'orders' && (
              <>
                <thead><tr><th>Order ID</th><th>Customer</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o.id}>
                      <td>{o.id}</td><td>{o.username}</td><td>{o.status}</td>
                      <td><button className="btn-edit-blue" onClick={() => setDetailItem({type: 'order', data: o})}>Detail</button></td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {(adminView === 'customers' || adminView === 'admin-list') && (
              <>
                <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {(adminView === 'customers' ? filteredCustomers : filteredAdmins).map(c => (
                    <tr key={c.id}>
                      <td>{c.username}</td><td>{c.role}</td><td>{c.status}</td>
                      <td>
                        {c.id !== user.id ? (
                          <>
                            <button className="btn-edit-blue" onClick={() => setEditingItem({...c, type: 'user'})}>Edit</button>
                            <button className="btn-delete-red" onClick={() => triggerDelete('user', c.id, c.username)}>Delete</button>
                          </>
                        ) : <span className="badge-self">You</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </section>

      {(isAddModalOpen || editingItem || detailItem || confirmModal.isOpen) && (
        <div className="modal-overlay">
          
          {detailItem && (
            <div className="modal-box-large">
              <h4 className="modal-title">
                {detailItem.type === 'cart' 
                  ? `Live Shopping Cart: ${detailItem.user?.username}` 
                  : `Order History: #${detailItem.data?.id}`}
              </h4>
              
              <div className="modal-scroll-area">
                {detailItem.type === 'cart' ? (
                  <table className="inner-table">
                    <thead>
                      <tr><th>Product</th><th style={{textAlign:'center'}}>Qty</th><th>Total</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {allUserCarts.filter(item => {
                          // ⚠️ 修正：加入 return 關鍵字
                          return String(item.user_id || item.userId) === String(detailItem.user?.id);
                      }).length > 0 ? (
                          allUserCarts
                          .filter(item => String(item.user_id || item.userId) === String(detailItem.user?.id))
                          .map(i => (
                              <tr key={i.id}>
                                <td>{i.name}</td>
                                <td>
                                  <div className="qty-control-admin">
                                    <button className="qty-btn-vivid" onClick={() => updateCartQty(i.id, i.quantity - 1)}>-</button>
                                    <span className="qty-text">{i.quantity}</span>
                                    <button className="qty-btn-vivid" onClick={() => updateCartQty(i.id, i.quantity + 1)}>+</button>
                                  </div>
                                </td>
                                <td>${(i.price * i.quantity).toFixed(2)}</td>
                                <td><button className="btn-delete-red-small" onClick={() => triggerDelete('cart-item', i.id, i.name)}>Remove</button></td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>No items found in active cart.</td></tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="order-detail-container">
                    <div className="info-group"><strong>Customer:</strong> {detailItem.data?.username}</div>
                    
                    <h5 style={{marginTop: '20px', marginBottom: '10px'}}>Purchased Items:</h5>
                    <table className="inner-table" style={{background: '#f9f9f9'}}>
                        <thead>
                          <tr><th>Product</th><th>Qty</th><th>Price at Purchase</th></tr>
                        </thead>
                        <tbody>
                        {detailItem.data?.items && detailItem.data.items.length > 0 ? (
                            detailItem.data.items.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>${Number(item.price_at_purchase).toFixed(2)}</td>
                            </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" style={{textAlign:'center'}}>No items record found for this order.</td></tr>
                        )}
                        </tbody>
                    </table>

                    <div className="status-management" style={{marginTop: '25px', padding: '15px', border: '1px solid #eee', borderRadius: '8px'}}>
                        <div className="info-group">
                        <strong>Order Status:</strong>
                        <select className="full-select" value={detailItem.data?.status} onChange={(e) => updateOrder(detailItem.data.id, { status: e.target.value })}>
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                        </select>
                        </div>
                        <div className="info-group">
                        <strong>Admin Notes:</strong>
                        <textarea 
                            className="full-textarea" 
                            value={detailItem.data?.notes || ""} 
                            placeholder="Internal notes..."
                            onChange={(e) => updateOrder(detailItem.data.id, { notes: e.target.value })} 
                        />
                        </div>
                    </div>
                    <button className="btn-delete-red-wide" style={{marginTop: '20px'}} onClick={() => triggerDelete('order', detailItem.data.id, `Order #${detailItem.data.id}`)}>Delete Order Record</button>
                  </div>
                )}
              </div>
              <div className="modal-footer-btns">
                <button className="btn-gray" onClick={() => setDetailItem(null)}>Close Window</button>
              </div>
            </div>
          )}

          {editingItem && (
            <div className="modal-box">
              <h4 style={{marginBottom: '20px'}}>Edit User: {editingItem.username}</h4>
              <div className="modal-body-fixed">
                <label className="field-label">Account Permission</label>
                <select className="full-select" value={editingItem.role} onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}><option value="user">User</option><option value="admin">Admin</option></select>
                <label className="field-label">Login Status</label>
                <select className="full-select" value={editingItem.status} onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}><option value="active">Active</option><option value="suspended">Suspended</option></select>
              </div>
              <div className="modal-footer-btns">
                <button className="btn-gray" onClick={() => setEditingItem(null)}>Cancel</button>
                <button className="btn-red" onClick={() => updateAccount(editingItem.id, editingItem)}>Save Changes</button>
              </div>
            </div>
          )}

          {isAddModalOpen && (
            <div className="modal-box">
              <h4>Register New Admin</h4>
              <form onSubmit={handleAddAdmin}>
                <div className="modal-body-fixed">
                  <input className="full-input" placeholder="Username" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} required />
                  <input className="full-input" type="password" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} required />
                </div>
                <div className="modal-footer-btns">
                  <button type="button" className="btn-gray" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-red">Create</button>
                </div>
              </form>
            </div>
          )}

          {confirmModal.isOpen && (
            <div className="modal-box-confirm">
              <h3 className="danger-title">{confirmModal.title}</h3>
              <p className="confirm-msg-text">{confirmModal.message}</p>
              <div className="modal-footer-btns">
                <button className="btn-gray" onClick={() => setConfirmModal({...confirmModal, isOpen: false})}>Cancel</button>
                <button className="btn-red" onClick={executeConfirm}>Confirm Action</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;