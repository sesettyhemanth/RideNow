import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import api from '../../api.js';
import Icon from './Icon.jsx';
import AdminAvatar from './AdminAvatar.jsx';
import QrScanner from './QrScanner.jsx';
import { BrandMark, SidebarArt } from './Brand.jsx';
import { useOutsideClick } from '../hooks/adminHooks.js';
import { bookingCode, transactionId } from '../utils/adminHelpers.js';
import '../styles/AdminTheme.css';
import '../styles/AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: 'layoutDashboard', end: true },
  { to: '/admin/vehicles', label: 'Manage Vehicles', icon: 'car' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'calendar' },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/payments', label: 'Payments', icon: 'creditCard' },
  { to: '/admin/reports', label: 'Reports', icon: 'barChart' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

const SEARCHABLE = {
  '/admin/vehicles': 'vehicles',
  '/admin/bookings': 'bookings',
  '/admin/users': 'users',
  '/admin/payments': 'payments',
};

const COLLAPSE_KEY = 'ridenow_admin_sidebar_collapsed';

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

function QrIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" />
    </svg>
  );
}

function AdminLayout() {
  const { admin, logoutAdmin } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/admin';

  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hasRecent, setHasRecent] = useState(false);
  const profileRef = useRef(null);

  useOutsideClick(profileRef, () => setMenuOpen(false), menuOpen);

  // close drawers whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
    setScanOpen(false);
  }, [path]);

  // red dot on the bell when something was booked in the last 24h
  useEffect(() => {
    let cancelled = false;
    api
      .get('/bookings')
      .then((res) => {
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recent = (res.data.data || []).some((b) => new Date(b.createdAt).getTime() > dayAgo);
        if (!cancelled) setHasRecent(recent);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSidebar = () => {
    if (window.matchMedia('(max-width: 900px)').matches) {
      setMobileOpen((open) => !open);
      return;
    }
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, value ? '0' : '1');
      } catch {
        /* storage unavailable - preference just won't persist */
      }
      return !value;
    });
  };

  const searchLabel = SEARCHABLE[path];
  const handleSearch = (e) => {
    e.preventDefault();
    const target = searchLabel ? path : '/admin/bookings';
    navigate(`${target}?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  const closeScanner = useCallback(() => setScanOpen(false), []);

  const handleScan = useCallback(
    async (raw) => {
      const text = String(raw || '').trim();
      if (!text) throw new Error('That QR code is empty.');

      // 1) collect every identifier that could be hidden inside the scanned text
      const candidates = new Set([text]);

      try {
        const json = JSON.parse(text);
        ['bookingId', 'booking', '_id', 'id', 'bookingCode', 'code', 'transactionId'].forEach((k) => {
          if (json && json[k]) candidates.add(String(json[k]));
        });
      } catch {
        /* not JSON - fine */
      }

      (text.match(/[a-f0-9]{24}/gi) || []).forEach((m) => candidates.add(m));

      try {
        const url = new URL(text);
        url.searchParams.forEach((v) => candidates.add(v));
        url.pathname.split('/').filter(Boolean).forEach((s) => candidates.add(s));
      } catch {
        /* not a URL - fine */
      }

      // 2) load the bookings and match any candidate against id / booking code / transaction id
      let bookings = [];
      try {
        const res = await api.get('/bookings');
        bookings = res.data.data || [];
      } catch {
        throw new Error('Could not load bookings from the server. Please try again.');
      }

      const needles = [...candidates].map((c) => c.toLowerCase());
      const match = bookings.find((b) => {
        const keys = [String(b._id || ''), bookingCode(b), transactionId(b), String(b.bookingCode || '')].map((k) =>
          k.toLowerCase()
        );
        return needles.some((n) => keys.includes(n));
      });

      if (!match) {
        const preview = text.length > 40 ? `${text.slice(0, 40)}...` : text;
        throw new Error(`No booking found for "${preview}".`);
      }

      setScanOpen(false);
      navigate(`/admin/verify/${match._id}`);
    },
    [navigate]
  );

  return (
    <div className={`admin-theme admin-shell ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-open' : ''}`}>
      <header className="admin-topbar">
        <Link to="/admin" className="admin-brand" aria-label="RideNow admin home">
          <BrandMark size={56} />
          <span className="admin-brand__text">
            Ride<span>Now</span>
          </span>
        </Link>

        <button type="button" className="admin-topbar__burger" onClick={toggleSidebar} aria-label="Toggle navigation">
          <Icon name="menu" size={22} />
        </button>

        <form className="admin-search" onSubmit={handleSearch} role="search">
          <Icon name="search" size={17} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchLabel ? `Search ${searchLabel}...` : 'Search bookings, users, vehicles...'}
            aria-label="Search"
          />
        </form>

        <div className="admin-topbar__spacer" />

        <button type="button" className="admin-topbar__scan" onClick={() => setScanOpen(true)} aria-label="Scan QR code">
          <QrIcon size={18} />
          <span>Scan QR</span>
        </button>

        <Link to="/admin/notifications" className="admin-topbar__bell" aria-label="Notifications">
          <Icon name="bell" size={20} />
          {hasRecent && <span className="admin-topbar__dot" />}
        </Link>

        <div className="admin-profile" ref={profileRef}>
          <button type="button" className="admin-profile__btn" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}>
            <AdminAvatar name={admin?.name || 'Admin'} seed={admin?.email || 'admin'} size={40} />
            <span className="admin-profile__name">{admin?.name || 'Admin'}</span>
            <Icon name="chevronDown" size={16} />
          </button>
          {menuOpen && (
            <div className="admin-profile__menu" role="menu">
              <div className="admin-profile__who">
                <strong>{admin?.name || 'Administrator'}</strong>
                <span>{admin?.email}</span>
              </div>
              <Link to="/admin/settings" role="menuitem">
                <Icon name="settings" size={15} /> Settings
              </Link>
              <button type="button" role="menuitem" onClick={handleLogout}>
                <Icon name="logout" size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <aside className="admin-sidebar">
        <nav className="admin-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <Icon name={item.icon} size={20} />
              <span className="admin-nav-link__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <SidebarArt />
      </aside>

      {mobileOpen && <button type="button" className="admin-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      <main className="admin-main">
        <Outlet />
      </main>

      <QrScanner open={scanOpen} onClose={closeScanner} onScan={handleScan} />
    </div>
  );
}

export default AdminLayout;