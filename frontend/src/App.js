import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import MyRentalsPage from "./pages/MyRentalsPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Persist user session (basic)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.role === 'admin') {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          user && user.role === 'admin'
            ? <Navigate to="/admin" />
            : <HomePage user={user} onLogout={handleLogout} />
        }
      />
      <Route
        path="/login"
        element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={user.role === 'admin' ? "/admin" : "/"} />}
      />
      <Route
        path="/register"
        element={!user ? <Register onRegisterSuccess={() => navigate("/login")} /> : <Navigate to={user.role === 'admin' ? "/admin" : "/"} />}
      />
      <Route
        path="/my-rentals"
        element={
          user
            ? (user.role === 'admin' ? <Navigate to="/admin" /> : <MyRentalsPage user={user} onLogout={handleLogout} />)
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/admin"
        element={user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;
