import React, { useState } from 'react';
import axios from 'axios';

function UserProfile({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    address: user?.address || "",
    phone: user?.phone || ""
  });

  // 電話限制邏輯：只能輸入數字且上限 10 碼
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // 移除所有非數字字元
    if (value.length <= 10) {
      setProfile({ ...profile, phone: value });
    }
  };

  const handleSaveProfile = async () => {
    // 驗證電話長度
    if (profile.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/user/profile/${user?.id}`, profile);
      alert("Profile updated!");
      setIsEditing(false);
      if (onUpdate) onUpdate(); // 呼叫父組件重新獲取使用者資料
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <section className="card profile-card">
      <h3>{user?.role === 'admin' ? "🛠️ Admin Profile" : "👤 My Profile"}</h3>
      <hr className="separator" />
      
      {isEditing ? (
        <div className="edit-form">
          <label className="field-label">Full Name</label>
          <input 
            className="search-input" 
            value={profile.fullName}
            placeholder="Your full name"
            onChange={(e) => setProfile({...profile, fullName: e.target.value})}
          />
          
          <label className="field-label">Delivery Address</label>
          <input 
            className="search-input" 
            value={profile.address}
            placeholder="Street address, City, NSW"
            onChange={(e) => setProfile({...profile, address: e.target.value})}
          />
          
          <label className="field-label">Phone Number (10 digits)</label>
          <input 
            className="search-input" 
            value={profile.phone}
            placeholder="e.g. 0412345678"
            onChange={handlePhoneChange} 
          />
          
          <div className="form-actions">
            <button className="add-btn" onClick={handleSaveProfile}>Save Changes</button>
            <button className="admin-nav-btn" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="display-info">
          <p className="info-row"><strong>Username:</strong> {user?.username}</p>
          <p className="info-row">
            <strong>Role:</strong> 
            <span className={`role-badge ${user?.role === 'admin' ? 'role-admin' : 'role-user'}`}>
              {user?.role?.toUpperCase()}
            </span>
          </p>
          <p className="info-row"><strong>Full Name:</strong> {user?.fullName || "Not set"}</p>
          <p className="info-row"><strong>Phone:</strong> {user?.phone || "Not set"}</p>
          <p className="info-row"><strong>Address:</strong> {user?.address || "Not set"}</p>
          <button className="add-btn" onClick={() => setIsEditing(true)}>Edit Details</button>
        </div>
      )}
    </section>
  );
}

export default UserProfile;