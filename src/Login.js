import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });

      if (response.data.success) {
        onLogin(response.data.token);
        navigate('/balance');
      } else {
        setError(response.data.message || 'Invalid credentials!');
      }
    } catch (error) {
      setError('Server error! Please try again.');
    }
  };

  return (
    
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title">Welcome Back</h1>
          
          {error && <p className="error-message">{error}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="login-button">
              Log In
            </button>
          </form>

          <div className="signup-link">
            Don't have an account?
            <a href="#signup">Sign up</a>
          </div>
        </div>
      </div>
  );
};

export default Login;