import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard({ user }) {
  // --- 1. 狀態定義 ---
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminView, setAdminView] = useState('orders'); // 切換：'orders', 'customers', 'admins'
  const [searchQuery, setSearchQuery] = useState("");
  
  // 新增管理員表單狀態
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "", fullName: "", phone: "" });
  const [adminPhoneError, setAdminPhoneError] = useState("");

  // --- 2. 數據獲取 ---
  const fetchData = async () => {
    try {
      const [resOrders, resUsers] = await Promise.all([
        axios.get("http://localhost:3000/api/admin/orders"),
        axios.get("http://localhost:3000/api/admin/users")
      ]);
      setOrders(resOrders.data);
      setUsers(resUsers.data);
    } catch (err) {
      console.error("Data fetch failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 3. 邏輯處理 ---
  
  // 權限切換邏輯 (方法 B：升級/降級)
  const handleRoleChange = async (userId, currentRole) => {
    if (userId === user.id) return alert("You cannot change your own role!");
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await axios.put(`http://localhost:3000/api/admin/users/${userId}/role`, { newRole });
      fetchData();
    } catch (err) {
      alert("Update failed");
    }
  };

  // 手動建立管理員 (方法 A)
  const handleCreateAdmin = async () => {
    if (newAdmin.phone.length !== 10) {
      setAdminPhoneError("Phone must be 10 digits.");
      return;
    }
    try {
      await axios.post("http://localhost:3000/api/admin/create-admin", newAdmin);
      alert("New admin added successfully!");
      setNewAdmin({ username: "", password: "", fullName: "", phone: "" });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Creation failed");
    }
  };

  // 過濾邏輯
  const filteredOrders = orders.filter(o => o.product_name.toLowerCase().includes(searchQuery.toLowerCase()));
  const customers = users.filter(u => u.role === 'user' && u.username.toLowerCase().includes(searchQuery.toLowerCase()));
  const admins = users.filter(u => u.role === 'admin' && u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- 4. 畫面渲染 ---
  return (
    <div className="container">
      <div className="admin-header">
        <h2>🛠️ Admin Control Panel</h2>
        <p>Logged in as: <strong>{user?.username}</strong></p>
      </div>

      {/* 分頁導覽列 */}
      <div className="admin-internal-nav">
        <button className={`admin-nav-btn ${adminView === 'orders' ? 'active' : ''}`} onClick={() => setAdminView('orders')}>📦 Orders</button>
        <button className={`admin-nav-btn ${adminView === 'customers' ? 'active' : ''}`} onClick={() => setAdminView('customers')}>👥 Customers</button>
        <button className={`admin-nav-btn ${adminView === 'admins' ? 'active' : ''}`} onClick={() => setAdminView('admins')}>🛡️ Admin Team</button>
      </div>

      {/* 搜尋區域 */}
      <div className="admin-search-area">
        <input 
          className="search-input"
          placeholder={`Search ${adminView}...`} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <main className="admin-content">
        
        {/* 分頁一：訂單管理 */}
        {adminView === 'orders' && (
          <section className="card">
            <h3>Customer Orders Overview</h3>
            <table className="admin-table">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => (
                  <tr key={o.id}>
                    <td>{o.product_name}</td>
                    <td>${o.price}</td>
                    <td>{o.quantity}</td>
                    <td className="bold-text">${(o.price * o.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 分頁二：客戶資料管理 (CRM) */}
        {adminView === 'customers' && (
          <section className="card">
            <h3>👥 Registered Customers</h3>
            <table className="admin-table">
              <thead>
                <tr><th>Username</th><th>Profile Details</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td>{c.username}</td>
                    <td>
                      <div className="stats-text">Name: {c.full_name || 'N/A'}</div>
                      <div className="stats-text">Phone: {c.phone}</div>
                    </td>
                    <td>
                      <button className="add-btn sm-btn" onClick={() => handleRoleChange(c.id, c.role)}>Promote to Admin</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 分頁三：管理員團隊 (方法 A 所在地) */}
        {adminView === 'admins' && (
          <section className="card">
            <h3>🛡️ Admin Team Management</h3>
            
            {/* 方法 A：手動新增區塊 */}
            <div className="admin-create-box">
              <h4>Create New Administrator</h4>
              <div className="admin-form-row">
                <input className="search-input" placeholder="Username" value={newAdmin.username} onChange={(e)=>setNewAdmin({...newAdmin, username: e.target.value})}/>
                <input className="search-input" type="password" placeholder="Password" value={newAdmin.password} onChange={(e)=>setNewAdmin({...newAdmin, password: e.target.value})}/>
                <input className="search-input" placeholder="Full Name" value={newAdmin.fullName} onChange={(e)=>setNewAdmin({...newAdmin, fullName: e.target.value})}/>
                <input 
                  className={`search-input ${adminPhoneError ? 'input-error' : ''}`} 
                  placeholder="Phone" 
                  value={newAdmin.phone} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) {
                      setNewAdmin({...newAdmin, phone: val});
                      setAdminPhoneError(val.length > 0 && val.length < 10 ? "10 digits required" : "");
                    }
                  }}
                />
                <button className="add-btn" onClick={handleCreateAdmin}>Create</button>
              </div>
              {adminPhoneError && <div className="error-message">{adminPhoneError}</div>}
            </div>

            <table className="admin-table">
              <thead>
                <tr><th>Admin User</th><th>Role</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {admins.map(a => (
                  <tr key={a.id}>
                    <td>{a.username} {a.id === user.id && "(You)"}</td>
                    <td><span className="role-badge role-admin">ADMIN</span></td>
                    <td>
                      {a.id !== user.id && (
                        <button className="nav-btn sm-btn" onClick={() => handleRoleChange(a.id, a.role)}>Demote to User</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;