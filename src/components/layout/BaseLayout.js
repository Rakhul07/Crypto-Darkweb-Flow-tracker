import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from '../logo.jpg';
import "./logo.css";

const BaseLayout = (props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle menu function
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <div className="navbar-container">
        <nav className="navbar">
          <div className="navbar-brand">
            <img className="logo-img" src={logo} alt="Logo" />
          </div>

          {/* Navbar Menu - Appears when menuOpen is true */}
          <div className={`navbar-menu ${menuOpen ? "active" : ""}`}>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={() => setMenuOpen(false)}>Signup</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/analytics" onClick={() => setMenuOpen(false)}>Analytics</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/home" onClick={() => setMenuOpen(false)}>Home</Link>
                </li>
            </ul>
          </div>
        </nav>
      </div>
      {props.children}
    </>
  );
};

export default BaseLayout;
