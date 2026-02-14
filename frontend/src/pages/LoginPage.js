import React, { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../api";
import "./pages.css";

function LoginPage({ onLogin }) {
  const [role, setRole] = useState("user"); // 'user' or 'admin'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        // Enforce role check if needed, but the backend returns the role
        if (role === 'admin' && data.role !== 'admin') {
          setError("These are not admin credentials");
          return;
        }

        onLogin({
          username: data.username || username,
          role: data.role || 'user'
        });
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="login-page">
      <div className="page-container">
        <div className="card">
          <h2 className="page-title">{role === 'admin' ? 'Admin Login' : 'Deneth Login'}</h2>

          <div className="role-switcher">
            <button
              className={`role-btn ${role === 'user' ? 'active' : ''}`}
              onClick={() => { setRole('user'); setError(''); }}
            >
              Deneth
            </button>
            <button
              className={`role-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => { setRole('admin'); setError(''); }}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              className="form-input"
              type="text"
              placeholder={role === 'admin' ? "Admin Username" : "Deneth Username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              className="form-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn btn-primary" style={{ background: role === 'admin' ? '#0f172a' : '' }}>
              {role === 'admin' ? 'Login as Admin' : 'Login'}
            </button>
          </form>
          {error && <p className="error">{error}</p>}

          {role === 'user' && (
            <p style={{ marginTop: 12, textAlign: 'center' }}>
              Don't have an account? <Link to="/register" className="btn-link">Register</Link>
            </p>
          )}

          {role === 'admin' && (
            <p style={{ marginTop: 12, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
              Admin credentials are restricted.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
