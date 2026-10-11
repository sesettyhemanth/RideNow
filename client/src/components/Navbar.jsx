import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import logo from '../assets/logo.png'; 
import '../styles/Navbar.css';

function Navbar() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    navigate(trimmed ? `/vehicles?search=${encodeURIComponent(trimmed)}` : '/vehicles');
    closeMenu();
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="RideNow logo" className="logo-img" />
          <span className="logo-text">RideNow</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search bikes, scooters, cars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/vehicles" onClick={closeMenu}>
            Vehicles
          </NavLink>
          <NavLink to="/how-it-works" onClick={closeMenu}>
            How It Works
          </NavLink>
          <NavLink to="/about" onClick={closeMenu}>
            About Us
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
          {user && (
            <NavLink to="/profile" onClick={closeMenu}>
              Profile
            </NavLink>
          )}

          {/* Login / Sign Up inside the menu on mobile */}
          {!user && (
            <div className="navbar-actions navbar-actions-mobile">
              <AuthActions onNavigate={closeMenu} />
            </div>
          )}
        </nav>

        {!user && (
          <div className="navbar-actions navbar-actions-desktop">
            <AuthActions onNavigate={closeMenu} />
          </div>
        )}

        <button
          className="navbar-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>
    </header>
  );
}

function AuthActions({ onNavigate }) {
  return (
    <>
      <Link to="/login" className="nav-btn nav-btn-outline" onClick={onNavigate}>
        Login
      </Link>
      <Link to="/signup" className="nav-btn nav-btn-solid" onClick={onNavigate}>
        Sign Up
      </Link>
    </>
  );
}

export default Navbar;