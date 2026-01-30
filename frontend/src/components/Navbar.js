import React from 'react';
import { Navbar as RBNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../pages/pages.css';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <RBNavbar expand="lg" className="site-nav" bg="white">
      <Container className="nav-inner">
        <RBNavbar.Brand as={Link} to="/" className="brand">EasyRent</RBNavbar.Brand>
        <RBNavbar.Toggle aria-controls="main-nav" />
        <RBNavbar.Collapse id="main-nav">
          <Nav className="mx-auto nav-center">
            {user && user.role === 'admin' ? (
              <Nav.Link as={Link} to="/admin" className="nav-link" style={{ color: '#6366f1' }}>Admin Dashboard</Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/" className="nav-link">Home</Nav.Link>
                <Nav.Link as={Link} to="/" className="nav-link">Vehicles</Nav.Link>
                {user && <Nav.Link as={Link} to="/my-rentals" className="nav-link">My Rentals</Nav.Link>}
              </>
            )}
          </Nav>
          <div className="nav-right d-flex align-items-center">
            {user ? (
              <>
                <div className="me-3">Hello, <strong>{user.username}</strong></div>
                <Button variant="outline-secondary" className="me-2" onClick={onLogout}>Sign out</Button>
              </>
            ) : (
              <>
                <Button variant="outline-secondary" className="btn-ghost me-2" onClick={() => navigate("/login")}>Sign in</Button>
                <Button className="nav-cta" onClick={() => navigate("/register")}>Register</Button>
              </>
            )}
          </div>
        </RBNavbar.Collapse>
      </Container>
    </RBNavbar>
  );
}

export default Navbar;
