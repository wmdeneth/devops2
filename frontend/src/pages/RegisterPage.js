import React, { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../api";
import "./pages.css";

function RegisterPage({ onRegisterSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setError("");
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="login-page">
      <div className="page-container">
        <div className="card">
          <h2 className="page-title">Register</h2>
          {success ? (
            <div style={{ color: "green", textAlign: 'center' }}>
              <p>Registration successful! You can now login.</p>
              <Link to="/login" className="btn btn-primary d-block mt-3">Go to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                className="form-input"
                type="text"
                placeholder="Username"
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
              <input
                className="form-input"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">Register</button>
            </form>
          )}
          {error && <p className="error">{error}</p>}

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link to="/login" className="btn-link">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
