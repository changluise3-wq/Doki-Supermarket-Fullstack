import React, { useState } from 'react';

function LoginModal({ isOpen, onClose, onLogin, onRegister }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhone(value);
      if (value.length > 0 && value.length < 10) {
        setPhoneError("Phone number must be 10 digits.");
      } else {
        setPhoneError(""); 
      }
    }
  };

  const handleSubmit = () => {
    if (isLoginView) {
      onLogin(username, password);
    } else {
      if (phone.length !== 10) {
        setPhoneError("Please enter exactly 10 digits.");
        return;
      }
      onRegister({ username, password, phone });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>Close</button>
        <h3 className="modal-title">{isLoginView ? "Login" : "Register Account"}</h3>
        
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Username" 
            className="search-input modal-input" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        
        <div className="input-group">
          <input 
            type="password" 
            placeholder="Password" 
            className="search-input modal-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        
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