import React from "react";
import "./pages.css";

function HomePage({ message, user, onLogout }) {
  return (
    <div className="page-container">
      <div className="card">
        <div className="site-logo" aria-hidden="true">
          <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#4facfe" />
                <stop offset="100%" stopColor="#00f2fe" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="52" fill="url(#g1)" />
            <g fill="#fff" transform="translate(30,30)">
              <rect x="8" y="8" width="44" height="8" rx="3" />
              <rect x="8" y="24" width="30" height="8" rx="3" />
              <circle cx="40" cy="16" r="6" />
            </g>
          </svg>
        </div>
        <h1 className="page-title">Frontend React App</h1>
        <h2>{message ? message : "Loading..."}</h2>
        <p>Welcome, {user.username}!</p>
        <button onClick={onLogout} className="btn" style={{ backgroundColor: '#dc3545', color: '#fff', marginTop: '12px' }}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default HomePage;
