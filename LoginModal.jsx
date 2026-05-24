import React, { useState } from 'react';
// 接收來自 App.jsx 的 Props 參數
function LoginModal({ isOpen, onClose, onLogin, onRegister }) {

  // 控制目前顯示的是登入(true) 還是 註冊(false) 畫面
  const [isLoginView, setIsLoginView] = useState(true);

  // 儲存使用者輸入的變數狀態
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(""); // 儲存電話格式錯誤的訊息

  // 如果這個 Modal 沒有被打開 (isOpen === false)，就什麼都不渲染
  if (!isOpen) return null;

  // 處理電話輸入防呆：只能輸入數字，且上限 10 碼
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // 利用正規表達式移除非數字的字元
    if (value.length <= 10) {
      setPhone(value);  // 更新電話狀態
      if (value.length > 0 && value.length < 10) {
        setPhoneError("Phone number must be 10 digits."); // 不足10碼顯示錯誤
      } else {
        setPhoneError(""); // 剛好10碼則清空錯誤
      }
    }
  };

// 當使用者點擊「送出按鈕」時觸發
  const handleSubmit = async () => {
    if (isLoginView) {
      // 點擊【登入】: 呼叫 App.jsx 傳下來的登入函式
      onLogin(username, password);
    } else {
      // 點擊【註冊】: 先檢查電話有沒有滿 10 碼
      if (phone.length !== 10) {
        setPhoneError("Please enter exactly 10 digits.");
        return;
      }

      try {
        // 1. 先執行 App.jsx 傳下來的註冊發送
        await onRegister({ username, password, phone });

      // 2. 如果成功沒有噴錯誤，直接在這裡清空與切換！
        setIsLoginView(true); 
        setUsername("");      
        setPassword("");      
        setPhone("");         
        setPhoneError("");    
      } catch (err) {
        console.error("Registration UI reset error:", err);
      }
    }
  };

  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* 右上角的關閉按鈕 */}
        <button className="close-btn" onClick={onClose}>Close</button>
        {/* 依據目前的 View 動態顯示標題 */}
        <h3 className="modal-title">{isLoginView ? "Login" : "Register Account"}</h3>

        {/* 帳號輸入框 */}
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Username" 
            className="search-input modal-input" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>

        {/* 密碼輸入框 */}
        <div className="input-group">
          <input 
            type="password" 
            placeholder="Password" 
            className="search-input modal-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        
        {/* 如果目前是「註冊畫面」，才額外顯示電話輸入框 */}
        {!isLoginView && (
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Phone Number (10 digits)" 
              className={phoneError ? 'search-input modal-input input-error' : 'search-input modal-input'}
              value={phone}
              onChange={handlePhoneChange} 
            />
            {phoneError && <div className="error-text">{phoneError}</div>}
          </div>
        )}
        
        <button className="add-btn full-width" onClick={handleSubmit}>
          {isLoginView ? "Sign In" : "Create Account"}
        </button>

        <div className="modal-footer">
          <p className="footer-text">
            {isLoginView ? "New customer? " : "Existing customer? "}
            <span className="text-link" onClick={() => {
              setIsLoginView(!isLoginView);
              setPhoneError(""); 
            }}>
              {isLoginView ? "Register Here" : "Back to Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;