import React, { useEffect, useState } from "react";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";

function App() {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (user) {
      fetch("http://localhost:4000/api/hello")
        .then(res => res.json())
        .then(data => setMessage(data.message))
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setMessage("");
  };

  if (!user) {
    return (
      <div>
        {showRegister ? (
          <>
            <Register onRegisterSuccess={() => setShowRegister(false)} />
            <p style={{ textAlign: "center" }}>
              Already have an account?{" "}
              <button 
                onClick={() => setShowRegister(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  textDecoration: "underline",
                  cursor: "pointer"
                }}
              >
                Login here
              </button>
            </p>
          </>
        ) : (
          <>
            <Login onLogin={setUser} />
            <p style={{ textAlign: "center" }}>
              Don't have an account?{" "}
              <button 
                onClick={() => setShowRegister(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  textDecoration: "underline",
                  cursor: "pointer"
                }}
              >
                Register here
              </button>
            </p>
          </>
        )}
      </div>
    );
  }

  return <HomePage message={message} user={user} onLogout={handleLogout} />;
}

export default App;
