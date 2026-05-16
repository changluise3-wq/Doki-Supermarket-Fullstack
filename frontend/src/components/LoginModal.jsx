import React, { useState } from 'react';

function LoginModal({ isOpen, onClose, onLogin, onRegister }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(""); // 儲存電話錯誤訊息

  if (!isOpen) return null;

  // 電話輸入處理：限制數字與 10 碼
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // 即時移除所有非數字字元
    
    if (value.length <= 10) {
      setPhone(value);
      // 如果正在輸入且未滿 10 碼，可以給予提示，或等提交時再驗證
      if (value.length > 0 && value.length < 10) {
        setPhoneError("Phone number must be 10 digits.");
      } else {
        setPhoneError(""); // 剛好 10 碼或清空時移除錯誤
      }
    }
  };

  const handleSubmit = () => {
    if (isLoginView) {
      onLogin(username, password);
    } else {
      // 註冊前的最後檢查
      if (phone.length !== 10) {
        setPhoneError("Please enter exactly 10 digits.");
        return;
      }
      onRegister({ username, password, phone });
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h3>{isLoginView ? "Login" : "Register Account"}</h3>
        
        <input 
          type="text" 
          placeholder="Username" 
          className="search-input modal-input-group" 
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          className="search-input modal-input-group" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        {/* 註冊模式下才顯示電話欄位 */}
        {!isLoginView && (
          <>
            <input 
              type="text" 
              placeholder="Phone Number (10 digits)" 
              className={`search-input modal-input-group ${phoneError ? 'input-error' : ''}`}
              value={phone}
              onChange={handlePhoneChange} 
            />
            {/* 錯誤提醒文字 */}
            {phoneError && <div className="error-message">{phoneError}</div>}
          </>
        )}
        
        <button className="add-btn" onClick={handleSubmit}>
          {isLoginView ? "Sign In" : "Create Account"}
        </button>

        <p className="modal-footer-text">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <span className="modal-link" onClick={() => {
            setIsLoginView(!isLoginView);
            setPhoneError(""); // 切換時清空錯誤訊息
          }}>
            {isLoginView ? "Register Now" : "Back to Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginModal;