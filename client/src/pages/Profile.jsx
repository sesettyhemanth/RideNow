import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { serverURL } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import QRCode from 'qrcode';
import LicenseSection from '../components/LicenseSection.jsx';
import { vehicleImageUrl, vehicleImageCount } from '../utils/vehicleImage.js';
import '../styles/Profile.css';
import '../styles/ProfileBookingView.css';

import heroImage from '../assets/hero.png';
import bikeImg from '../assets/bike.png';
import scooterImg from '../assets/scooter.png';
import carImg from '../assets/car.png';

const NAV = [
  { key: 'profile', label: 'Profile Detail', icon: 'user', title: 'Profile Detail', subtitle: 'Manage your personal information and account details.' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar', title: 'My Bookings', subtitle: 'Here are the details of your recent and upcoming bookings.' },
  { key: 'documents', label: 'Documentation', icon: 'file', title: 'Documentation', subtitle: 'Your driving license and verification status.' },
  { key: 'history', label: 'History', icon: 'history', title: 'Rental History', subtitle: 'Completed and cancelled rentals.' },
  { key: 'settings', label: 'Settings', icon: 'settings', title: 'Settings', subtitle: 'Manage your account settings, preferences and security.' },
  { key: 'wishlist', label: 'Wishlist', icon: 'heart', title: 'My Wishlist', subtitle: 'Your saved vehicles for later. Keep track of the ones you love!' },
  { key: 'notifications', label: 'Notification', icon: 'bell', title: 'Notifications', subtitle: 'Reminders about your upcoming rentals.' },
];

const licenseStatusLabel = {
  not_submitted: 'Not submitted',
  pending: 'Pending verification',
  verified: 'Verified',
  rejected: 'Rejected',
};

const typeImage = { bike: bikeImg, scooter: scooterImg, car: carImg };

const ICONS = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  calendar: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 2v4M8 2v4M3 10h18',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
  pin: 'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  trash: 'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  chevron: 'M9 18l6-6-6-6',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  car: 'M5 17h14M3 13l2-6a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 6v4H3zM7 17v2M17 17v2',
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      className="pf-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

function Profile() {
  const { user, updateUser, logoutUser } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [bookingFilter, setBookingFilter] = useState('all');
  const [viewing, setViewing] = useState(null);
  const [wishlistFilter, setWishlistFilter] = useState('all');

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', dateOfBirth: '', gender: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [prefs, setPrefs] = useState({ vehicleType: 'car', location: 'Visakhapatnam, Andhra Pradesh', language: 'English' });
  const [notify, setNotify] = useState({ booking: true, offers: true, arrivals: true, promos: false });
  const [theme, setTheme] = useState('light');
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fillForm = (u) =>
    setForm({
      name: u.name || '',
      phone: u.phone || '',
      dateOfBirth: (u.dateOfBirth || u.dob || '').slice(0, 10),
      gender: u.gender || '',
      location: u.location || u.city || '',
    });

  useEffect(() => {
    if (user && !editing) fillForm(user);
  }, [user?.name, user?.phone, user?.dateOfBirth, user?.gender, user?.location]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError('');

      let meData = null;
      let bookingsData = [];
      let favoritesData = [];

      try {
        const meRes = await api.get('/auth/me');
        meData = meRes.data.data;
      } catch (err) {
        console.error("Failed to load /auth/me:", err);
      }

      try {
        const bookingsRes = await api.get('/bookings/mine');
        bookingsData = bookingsRes.data.data || [];
      } catch (err) {
        console.error("Failed to load bookings:", err);
      }

      try {
        const favoritesRes = await api.get('/users/me/favorites');
        favoritesData = favoritesRes.data.data || [];
      } catch (err) {
        console.error("Failed to load favorites:", err);
      }

      if (meData) updateUser({ ...user, ...meData });
      setBookings(bookingsData);
      setFavorites(favoritesData);

      try {
        const vehiclesRes = await api.get('/vehicles');
        const list = vehiclesRes.data?.data ?? vehiclesRes.data;
        setVehicles(Array.isArray(list) ? list : list?.vehicles || []);
      } catch (e) {
        setVehicles([]);
      }
    } catch (err) {
      setError('Could not load your account data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setAvatarUploading(true);
      await api.put('/users/me/avatar', formData);
      updateUser({ ...user, hasProfileImage: true });
    } catch (err) {
      alert('Could not upload your photo. Please try a smaller JPG, PNG or WEBP file.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const removeFavorite = async (vehicleId) => {
    await api.delete(`/users/me/favorites/${vehicleId}`);
    setFavorites((prev) => prev.filter((v) => (v.id || v._id) !== vehicleId));
  };

  const startEdit = () => {
    fillForm(user);
    setSaveMsg('');
    setEditing(true);
  };

  const cancelEdit = () => {
    fillForm(user);
    setSaveMsg('');
    setEditing(false);
  };

  const saveProfile = async () => {
    if (!form.name.trim()) {
      setSaveMsg('Name cannot be empty.');
      return;
    }
    try {
      setSaving(true);
      setSaveMsg('');
      const res = await api.put('/users/me', form);
      updateUser({ ...user, ...form, ...(res.data?.data || {}) });
      setEditing(false);
      setSaveMsg('Profile updated.');
    } catch (err) {
      setSaveMsg(err.response?.data?.message || 'Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  if (!user) {
    return (
      <section className="profile-page container">
        <p>
          Please <Link to="/login?redirect=/profile">login</Link> to view your account.
        </p>
      </section>
    );
  }

  const userId = user.id || user._id;
  const displayName = user.name || user.email || 'User';
  const licenseStatus = user.licenseStatus || 'not_submitted';

  const upcomingBookings = bookings.filter((b) => ['pending', 'confirmed', 'picked_up'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  const shownBookings =
    bookingFilter === 'upcoming' ? upcomingBookings : bookingFilter === 'completed' ? completedBookings : bookings;

  const findVehicle = (booking) => {
    if (booking.vehicle && typeof booking.vehicle === 'object') return booking.vehicle;
    const id = String(booking.vehicleId || booking.vehicle || '');
    const pool = [...vehicles, ...favorites];
    return (
      pool.find((v) => id && String(v.id || v._id) === id) ||
      pool.find((v) => v.name === booking.vehicleName) ||
      null
    );
  };

  const countType = (t) => favorites.filter((v) => (v.type || '').toLowerCase() === t).length;
  const shownFavorites =
    wishlistFilter === 'all' ? favorites : favorites.filter((v) => (v.type || '').toLowerCase() === wishlistFilter);

  const page = NAV.find((n) => n.key === activeTab);

  const avatar = (
    <>
      {user.hasProfileImage ? (
        <img src={`${serverURL}/api/users/${userId}/avatar`} alt={displayName} />
      ) : (
        <span className="pf-avatar-fallback">{displayName.charAt(0).toUpperCase()}</span>
      )}
    </>
  );

  return (
    <section className={`profile-page container pf-${theme}`}>
      {error && <p className="error-text">{error}</p>}

      <div className="pf-shell">
        <aside className="pf-sidebar">
          <div className="pf-user">
            <div className="pf-avatar">{avatar}</div>
            <h3>{displayName}</h3>
            <p>{user.email}</p>
          </div>

          <nav className="pf-nav">
            {NAV.map((item) => (
              <button
                key={item.key}
                className={activeTab === item.key ? 'active' : ''}
                onClick={() => setActiveTab(item.key)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {activeTab === item.key && item.key !== 'notifications' && (
                  <Icon name="chevron" size={14} />
                )}
              </button>
            ))}
            <div className="pf-nav-divider" />
            <button className="pf-logout" onClick={handleLogout}>
              <Icon name="logout" />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <div className="pf-main">
          <header className="pf-banner">
            <div className="pf-banner-icon">
              <Icon name={page.icon} size={22} />
            </div>
            <div className="pf-banner-text">
              <h1>{page.title}</h1>
              <p>{page.subtitle}</p>
            </div>
            <img className="pf-banner-art" src={heroImage} alt="" aria-hidden="true" />
          </header>

          <div className="pf-panel">
            {loading && <p className="pf-muted">Loading...</p>}

            {!loading && activeTab === 'profile' && (
              <div>
                <div className="pf-profile-head">
                  <label className="pf-avatar pf-avatar-lg pf-avatar-upload">
                    {avatar}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleAvatarChange}
                      hidden
                    />
                    <span className="pf-camera">{avatarUploading ? '…' : <Icon name="camera" size={14} />}</span>
                  </label>
                  <div className="pf-profile-name">
                    <h2>{displayName}</h2>
                    <p>{user.email}</p>
                  </div>
                  {editing ? (
                    <div className="pf-edit-actions">
                      <button className="pf-btn-outline" onClick={cancelEdit} disabled={saving}>
                        Cancel
                      </button>
                      <button className="pf-btn-solid" onClick={saveProfile} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  ) : (
                    <button className="pf-btn-outline" onClick={startEdit}>
                      <Icon name="edit" size={15} /> Edit Profile
                    </button>
                  )}
                </div>
                {saveMsg && <p className="pf-save-msg pf-save-top">{saveMsg}</p>}

                <div className="pf-info-grid">
                  <InfoCard icon="user" label="Full Name" value={displayName} editing={editing}>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </InfoCard>
                  <InfoCard icon="calendar" label="Date of Birth" value={formatDate(user.dateOfBirth || user.dob)} editing={editing}>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    />
                  </InfoCard>
                  <InfoCard icon="mail" label="Email Address" value={user.email} />
                  <InfoCard icon="user" label="Gender" value={user.gender || 'Not set'} editing={editing}>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </InfoCard>
                  <InfoCard icon="phone" label="Phone Number" value={user.phone || 'Not set'} editing={editing}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </InfoCard>
                  <InfoCard icon="pin" label="Location" value={user.location || user.city || 'Not set'} editing={editing}>
                    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </InfoCard>
                  <InfoCard
                    icon="shield"
                    label="Sign-in Method"
                    value={user.isGoogleAccount || user.googleId ? 'Google' : 'Email & Password'}
                  />
                  <InfoCard icon="file" label="Driving License" value={licenseStatusLabel[licenseStatus]} />
                </div>
              </div>
            )}

            {!loading && activeTab === 'bookings' && (
              <div>
                <div className="pf-filters">
                  <FilterPill active={bookingFilter === 'all'} onClick={() => setBookingFilter('all')}>
                    All Bookings ({bookings.length})
                  </FilterPill>
                  <FilterPill active={bookingFilter === 'upcoming'} onClick={() => setBookingFilter('upcoming')}>
                    Upcoming ({upcomingBookings.length})
                  </FilterPill>
                  <FilterPill active={bookingFilter === 'completed'} onClick={() => setBookingFilter('completed')}>
                    Completed ({completedBookings.length})
                  </FilterPill>
                </div>

                {shownBookings.length === 0 && (
                  <p className="pf-muted">
                    No bookings here yet. <Link to="/vehicles">Browse vehicles</Link> to get started.
                  </p>
                )}
                {shownBookings.map((booking) => (
                  <BookingRow key={booking._id} booking={booking} vehicle={findVehicle(booking)} onView={setViewing} />
                ))}
              </div>
            )}

            {!loading && activeTab === 'documents' && (
              <div className="pf-doc">
                <LicenseSection />
              </div>
            )}

            {!loading && activeTab === 'history' && (
              <div>
                {pastBookings.length === 0 && (
                  <p className="pf-muted">Nothing here yet. Completed and cancelled bookings show up in this tab.</p>
                )}
                {pastBookings.map((booking) => (
                  <BookingRow key={booking._id} booking={booking} vehicle={findVehicle(booking)} onView={setViewing} />
                ))}
              </div>
            )}

            {!loading && activeTab === 'settings' && (
              <div className="pf-settings">
                <SettingsCard icon="settings" title="Preferences" sub="Customize your ride experience">
                  <label className="pf-field">
                    <span>Preferred Vehicle Type</span>
                    <select value={prefs.vehicleType} onChange={(e) => setPrefs({ ...prefs, vehicleType: e.target.value })}>
                      <option value="car">Cars</option>
                      <option value="bike">Bikes</option>
                      <option value="scooter">Scooters</option>
                    </select>
                  </label>
                  <label className="pf-field">
                    <span>Default Pickup Location</span>
                    <select value={prefs.location} onChange={(e) => setPrefs({ ...prefs, location: e.target.value })}>
                      <option>Visakhapatnam, Andhra Pradesh</option>
                      <option>Bengaluru, Karnataka</option>
                      <option>Mysuru, Karnataka</option>
                    </select>
                  </label>
                  <label className="pf-field">
                    <span>Language</span>
                    <select value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}>
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Telugu</option>
                      <option>Kannada</option>
                    </select>
                  </label>
                </SettingsCard>

                <SettingsCard icon="shield" title="Security" sub="Keep your account safe">
                  <button className="pf-link-row" onClick={() => navigate('/forgot-password')}>
                    <span>Change Password</span>
                    <Icon name="chevron" size={14} />
                  </button>
                  <div className="pf-link-row">
                    <span>Two-Factor Authentication</span>
                    <Toggle checked={twoFactor} onChange={setTwoFactor} label="Two-factor authentication" />
                  </div>
                </SettingsCard>

                <SettingsCard icon="bell" title="Notifications" sub="Choose what you want to be notified about">
                  {[
                    ['booking', 'Booking Updates'],
                    ['offers', 'Offers & Discounts'],
                    ['arrivals', 'New Vehicle Arrivals'],
                    ['promos', 'Promotions & News'],
                  ].map(([key, label]) => (
                    <div className="pf-toggle-row" key={key}>
                      <span>{label}</span>
                      <Toggle checked={notify[key]} onChange={(v) => setNotify({ ...notify, [key]: v })} label={label} />
                    </div>
                  ))}
                </SettingsCard>

                <SettingsCard icon="sun" title="Appearance" sub="Choose your preferred theme">
                  <button
                    className={`pf-theme-option ${theme === 'light' ? 'selected' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <Icon name="sun" /> <span>Light Mode</span> <i className="pf-radio" />
                  </button>
                  <button
                    className={`pf-theme-option ${theme === 'dark' ? 'selected' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <Icon name="moon" /> <span>Dark Mode</span> <i className="pf-radio" />
                  </button>
                </SettingsCard>
              </div>
            )}

            {!loading && activeTab === 'wishlist' && (
              <div>
                <div className="pf-filters">
                  <FilterPill active={wishlistFilter === 'all'} onClick={() => setWishlistFilter('all')}>
                    All ({favorites.length})
                  </FilterPill>
                  <FilterPill active={wishlistFilter === 'bike'} onClick={() => setWishlistFilter('bike')}>
                    Bikes ({countType('bike')})
                  </FilterPill>
                  <FilterPill active={wishlistFilter === 'scooter'} onClick={() => setWishlistFilter('scooter')}>
                    Scooters ({countType('scooter')})
                  </FilterPill>
                  <FilterPill active={wishlistFilter === 'car'} onClick={() => setWishlistFilter('car')}>
                    Cars ({countType('car')})
                  </FilterPill>
                </div>

                {shownFavorites.length === 0 && (
                  <p className="pf-muted">No saved vehicles yet. Tap the ♡ on any vehicle to save it here.</p>
                )}

                <div className="pf-wish-grid">
                  {shownFavorites.map((vehicle) => {
                    const vehicleId = vehicle.id || vehicle._id;
                    return (
                      <div key={vehicleId} className="pf-wish-card">
                        <div className="pf-wish-img">
                          {vehicleImageCount(vehicle) > 0 ? (
                            <img src={vehicleImageUrl(vehicle)} alt={vehicle.name} />
                          ) : (
                            <img src={typeImage[(vehicle.type || '').toLowerCase()] || heroImage} alt={vehicle.name} />
                          )}
                        </div>
                        <h4>{vehicle.name}</h4>
                        <span className="pf-tag">{vehicle.type}</span>
                        <p className="pf-price">₹{formatMoney(vehicle.pricePerDay)} / day</p>
                        <div className="pf-wish-actions">
                          <Link to={`/vehicles/${vehicle.type}/${vehicleId}`} className="pf-btn-solid">
                            <Icon name="eye" size={14} /> View Details
                          </Link>
                          <button className="pf-btn-outline" onClick={() => removeFavorite(vehicleId)}>
                            <Icon name="trash" size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!loading && activeTab === 'notifications' && (
              <div>
                {upcomingBookings.length === 0 && <p className="pf-muted">You're all caught up.</p>}
                {upcomingBookings.map((b) => (
                  <div className="pf-notice" key={b._id}>
                    <span className="pf-info-icon"><Icon name="bell" /></span>
                    <div>
                      <strong>Upcoming: {b.vehicleName}</strong>
                      <p>
                        Pickup on {b.pickupDate} at {b.pickupLocation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {viewing && (
        <BookingViewModal
          booking={viewing}
          vehicle={findVehicle(viewing)}
          onClose={() => setViewing(null)}
        />
      )}
    </section>
  );
}

function InfoCard({ icon, label, value, editing, children }) {
  const isEditing = editing && children;
  return (
    <div className={`pf-info-card${isEditing ? ' is-editing' : ''}`}>
      <span className="pf-info-icon"><Icon name={icon} /></span>
      <div>
        <small>{label}</small>
        {isEditing ? children : <strong>{value || 'Not set'}</strong>}
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button className={`pf-filter ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function SettingsCard({ icon, title, sub, children }) {
  return (
    <div className="pf-set-card">
      <div className="pf-set-head">
        <span className="pf-info-icon"><Icon name={icon} /></span>
        <div>
          <h4>{title}</h4>
          <small>{sub}</small>
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`pf-toggle ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

function BookingRow({ booking, vehicle, onView }) {
  const type = (booking.vehicleType || '').toLowerCase();
  const status = bookingStatusLabel(booking.status);
  return (
    <div className="pf-booking">
      <div className="pf-booking-img">
        {vehicle && vehicleImageCount(vehicle) > 0 ? (
          <img src={vehicleImageUrl(vehicle)} alt={booking.vehicleName} />
        ) : (
          <img src={typeImage[type] || heroImage} alt={booking.vehicleName} />
        )}
      </div>

      <div className="pf-booking-info">
        <h4>{booking.vehicleName}</h4>
        <span className="pf-tag">{booking.vehicleType}</span>
        <p><Icon name="calendar" size={13} /> {booking.pickupDate} → {booking.dropoffDate}</p>
        <p><Icon name="pin" size={13} /> {booking.pickupLocation}</p>
      </div>

      <div className="pf-booking-amount">
        <span className={`pf-status status-${status}`}>
          <i /> {status}
        </span>
        {booking._id && <small>Booking ID: #{String(booking._id).slice(-6).toUpperCase()}</small>}
        <strong>₹{formatMoney(booking.totalAmount)}</strong>
        <button type="button" className="pf-view-btn" onClick={() => onView(booking)}>
          <Icon name="file" size={14} /> View
        </button>
      </div>
    </div>
  );
}

function bookingStatusLabel(status) {
  if (status === 'confirmed') return 'upcoming';
  if (status === 'picked_up') return 'picked up';
  return status;
}

const PAYMENT_LABELS = { upi: 'UPI', card: 'Card', razorpay: 'Razorpay', cod: 'Cash on Delivery' };

function BookingViewModal({ booking, vehicle, onClose }) {
  const [qrUrl, setQrUrl] = useState('');
  const type = (booking.vehicleType || '').toLowerCase();
  const status = bookingStatusLabel(booking.status);
  const code = String(booking._id || '').slice(-6).toUpperCase();
  const showQr = ['pending', 'confirmed', 'picked_up'].includes(booking.status);

  useEffect(() => {
    let ignore = false;
    QRCode.toDataURL(`${window.location.origin}/admin/verify/${booking._id}`, { width: 240, margin: 1 })
      .then((url) => !ignore && setQrUrl(url))
      .catch(() => !ignore && setQrUrl(''));
    return () => {
      ignore = true;
    };
  }, [booking._id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rows = [
    ['Pickup Date', formatDate(booking.pickupDate)],
    ['Drop-off Date', formatDate(booking.dropoffDate)],
    ['Pickup Location', booking.pickupLocation],
    ['Add-ons', booking.addOns?.length ? booking.addOns.join(', ') : 'None'],
    ['Payment', PAYMENT_LABELS[booking.paymentMethod] || 'Online'],
    ['Booked On', formatDate(booking.createdAt)],
  ];

  return (
    <div className="pf-bv-backdrop" onMouseDown={onClose}>
      <div className="pf-bv-modal" role="dialog" aria-modal="true" aria-label="Booking details" onMouseDown={(e) => e.stopPropagation()}>
        <div className="pf-bv-head">
          <div>
            <h3>Booking Details</h3>
            <small>Booking ID: #{code}</small>
          </div>
          <button type="button" className="pf-bv-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="pf-bv-body">
          <div className="pf-bv-top">
            <div className="pf-bv-left">
              <div className="pf-bv-image">
                {vehicle && vehicleImageCount(vehicle) > 0 ? (
                  <img src={vehicleImageUrl(vehicle)} alt={booking.vehicleName} />
                ) : (
                  <img src={typeImage[type] || heroImage} alt={booking.vehicleName} />
                )}
              </div>

              {booking.status === 'pending' && (
                <p className="pf-bv-note">
                  Your vehicle is reserved. The booking is confirmed once our team verifies your driving license.
                </p>
              )}
            </div>

            <div className="pf-bv-title">
              <h4>{booking.vehicleName}</h4>
              <div className="pf-bv-meta">
                <span className="pf-tag">{booking.vehicleType}</span>
                <span className={`pf-status status-${booking.status}`}>
                  <i /> {status}
                </span>
              </div>
            </div>

            {showQr && (
              <div className="pf-bv-qr">
                {qrUrl ? <img src={qrUrl} alt="Booking QR code" /> : <p className="pf-muted">Generating QR...</p>}
                <small>Show this QR code at pickup.</small>
              </div>
            )}
          </div>

          <dl className="pf-bv-rows">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || '—'}</dd>
              </div>
            ))}
            <div className="pf-bv-total">
              <dt>Total Amount</dt>
              <dd>₹{formatMoney(booking.totalAmount)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function formatMoney(n) {
  if (n === undefined || n === null || n === '') return '0';
  return Number(n).toLocaleString('en-IN');
}

function formatDate(d) {
  if (!d) return 'Not set';
  const date = new Date(d);
  if (isNaN(date)) return String(d);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default Profile;