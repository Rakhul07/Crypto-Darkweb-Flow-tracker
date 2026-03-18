import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./logo.css";

const BaseLayout = (props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const close = () => setMenuOpen(false);

  const isActive = (path) =>
    location.pathname === path ? "site-nav-link active" : "site-nav-link";

  return (
    <div className="app-shell">
      <div className="navbar-container">
        <nav className="navbar">
          <div className="navbar-brand">
            <Link className="brand-link" to="/home" aria-label="CryptoChain home">
              <span className="brand-logo" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                  <path d="M4.75 6.5A1.75 1.75 0 0 1 6.5 4.75h9a1.75 1.75 0 0 1 1.75 1.75V7h1.25A1.5 1.5 0 0 1 20 8.5v7A1.5 1.5 0 0 1 18.5 17H17v.5a1.75 1.75 0 0 1-1.75 1.75h-8.75a1.75 1.75 0 0 1-1.75-1.75V6.5Zm1.5.1v10.8c0 .14.11.25.25.25h8.75c.14 0 .25-.11.25-.25V17h-2.75A1.75 1.75 0 0 1 11 15.25v-6.5A1.75 1.75 0 0 1 12.75 7H15.5v-.5a.25.25 0 0 0-.25-.25h-8.75a.25.25 0 0 0-.25.25Zm6.25 2.15v6.5c0 .14.11.25.25.25h5.75v-7h-5.75a.25.25 0 0 0-.25.25Zm4.25 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </span>
              <span className="brand-text">CryptoChain</span>
            </Link>
          </div>

          <div className="navbar-center">
            <div className={`navbar-menu${menuOpen ? " active" : ""}`}>
              <ul className="site-navbar-nav">
                <li className="site-nav-item">
                  <Link className={isActive("/home")} to="/home" onClick={close}>Home</Link>
                </li>
                <li className="site-nav-item">
                  <Link className={isActive("/balance")} to="/balance" onClick={close}>Dashboard</Link>
                </li>
                <li className="site-nav-item">
                  <Link className={isActive("/analytics")} to="/analytics" onClick={close}>Analytics</Link>
                </li>
              </ul>
            </div>
          </div>

          <button
            className="navbar-toggler"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="navbar-side">
            <Link className="navbar-cta" to="/balance" onClick={close}>
              Start Tracking
            </Link>
          </div>
        </nav>
      </div>

      <main className="app-shell-main">
        {props.children}
      </main>
    </div>
  );
};

export default BaseLayout;
