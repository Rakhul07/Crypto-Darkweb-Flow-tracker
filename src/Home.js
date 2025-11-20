import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, LineChart, ArrowRight } from 'lucide-react';
import './components/layout/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <nav className="home-nav">
        <div className="nav-logo">
          <Wallet className="logo-icon" />
          <span>CryptoChain</span>
        </div>
        <div className="nav-buttons">
          <Link to="/login" className="nav-button login">
            Login
          </Link>
          <Link to="/signup" className="nav-button signup">
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="home-main">
        <div className="hero-section">
          <h1 className="hero-title">
            Track Your Crypto Portfolio
            <LineChart className="inline-icon" />
          </h1>
          <p className="hero-subtitle">
            Real-time tracking, advanced analytics, and secure management of your cryptocurrency investments.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-button primary">
              Get Started <ArrowRight className="button-icon" />
            </Link>
            <Link to="/login" className="cta-button secondary">
              Login to Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
