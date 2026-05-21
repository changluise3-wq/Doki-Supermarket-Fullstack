import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserProfile({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: user?.fullName || user?.full_name || "",
    address: user?.address || "",
    phone: user?.phone || ""
  });

  // 進入編輯模式時，重新同步最新的 user 資料到輸入框
  const handleStartEdit = () => {
    setProfile({
      fullName: user?.fullName || user?.full_name || "",
      address: user?.address || "",
      phone: user?.phone || ""
    });
    setIsEditing(true);
  };

  // 修正電話輸入邏輯：確保只能輸入數字且上限 10 碼
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // 1. 允許空字串（這樣你才能把字刪掉）
    // 2. 檢查是否為純數字且長度 <= 10
    if (value === "" || (/^\d+$/.test(value) && value.length <= 10)) {
        setProfile(prev => ({ ...prev, phone: value }));
    }
  };

  const handleSaveProfile = async () => {
    // 驗證電話長度
    if (profile.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      const token = localStorage.getItem('token'); // 取得 Token
      
      // 執行更新，並帶上正確的 Headers 解決 401 問題
      await axios.put(`http://localhost:3000/api/user/profile/${user?.id}`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Profile updated successfully!");
      setIsEditing(false);
      
      // 觸發 App.jsx 的 fetchUserStatus 重新抓取資料庫內容
      if (onUpdate) onUpdate(); 
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed: " + (err.response?.data?.message || "Please check your connection"));
    }
  };

  return (
    <section className="card profile-card">
      <div className="profile-header">
        <h3 className="section-title">
          {user?.role === 'admin' ? "Administrator Profile" : "Customer Profile"}
        </h3>
      </div>
      <hr className="separator" />
      
      {isEditing ? (
        <div className="edit-form">
          <div className="form-group">
            <label className="field-label">Full Name</label>
            <input 
              className="search-input" 
              value={profile.fullName}
              placeholder="Enter your real name"
              onChange={(e) => setProfile({...profile, fullName: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="field-label">Delivery Address</label>
            <input 
              className="search-input" 
              value={profile.address}
              placeholder="e.g. 123 George St, Sydney, NSW"
              onChange={(e) => setProfile({...profile, address: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="field-label">Phone Number</label>
            <input 
              className="search-input" 
              value={profile.phone}
              placeholder="Must be 10 digits"
              onChange={handlePhoneChange} 
            />
          </div>
          
          <div className="form-actions">
            <button className="btn-edit-blue" onClick={handleSaveProfile}>Save Changes</button>
            <button className="btn-gray" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="display-info">
          <div className="info-row">
            <strong>Username:</strong> <span>{user?.username}</span>
          </div>
          <div className="info-row">
            <strong>Account Role:</strong> 
            <span className={`role-badge ${user?.role === 'admin' ? 'role-admin' : 'role-user'}`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
          <div className="info-row">
            <strong>Full Name:</strong> 
            <span>{user?.fullName || user?.full_name || "Not set"}</span>
          </div>
          <div className="info-row">
            <strong>Phone:</strong> 
            <span>{user?.phone || "Not set"}</span>
          </div>
          <div className="info-row">
            <strong>Delivery Address:</strong> 
            <span>{user?.address || "Not set"}</span>
          </div>
          <div className="profile-footer">
            <button className="btn-edit-blue" onClick={handleStartEdit}>Edit Profile Details</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default UserProfile;