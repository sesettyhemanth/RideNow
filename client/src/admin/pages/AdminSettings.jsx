import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import api from '../../api.js';
import BaseIcon from '../components/Icon.jsx';
import AdminAvatar from '../components/AdminAvatar.jsx';
import PageHeader from '../components/PageHeader.jsx';
import '../styles/AdminTheme.css';
import '../styles/AdminSettings.css';

// Adjust these to match your router.
const ROUTES = {
  login: '/login',
  bookings: '/admin/bookings',
  payments: '/admin/payments',
  help: '/admin/help',
};

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'security', label: 'Security', icon: 'shield' },
  { id: 'preferences', label: 'Preferences', icon: 'sliders' },
];

const PREF_STORAGE_KEY = 'ridenow_admin_prefs';
const DEFAULT_PREFS = { darkMode: false, emailNotifications: true, smsNotifications: true };


function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREF_STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable – preferences simply won't persist */
  }
}

function formatMemberSince(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function validateProfile({ name, email, phone }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required.';
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (phone.trim() && !/^[+\d][\d\s-]{6,}$/.test(phone.trim())) errors.phone = 'Enter a valid phone number.';
  return errors;
}

function validatePassword({ current, next, confirm }) {
  const errors = {};
  if (!current) errors.current = 'Enter your current password.';
  if (next.length < 8) errors.next = 'Use at least 8 characters.';
  else if (next === current) errors.next = 'New password must differ from the current one.';
  if (confirm !== next) errors.confirm = 'Passwords do not match.';
  return errors;
}

const PAGE_ICONS = {
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  payments: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  'chevron-right': <polyline points="9 18 15 12 9 6" />,
  'eye-off': (
    <>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  sliders: (
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
};

function Icon({ name, size = 18, strokeWidth = 2, ...rest }) {
  const shape = PAGE_ICONS[name];
  if (!shape) return <BaseIcon name={name} size={size} strokeWidth={strokeWidth} {...rest} />;
  return (
    <svg
      className="ad-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {shape}
    </svg>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div className={`st-field${error ? ' st-field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <small className="st-field__error">{error}</small>}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, placeholder, error, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field id={id} label={label} error={error}>
      <div className="st-input st-input--icon">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="st-input__btn"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={16} />
        </button>
      </div>
    </Field>
  );
}

function ToggleRow({ icon, title, description, checked, onChange }) {
  return (
    <div className="st-toggle-row">
      <span className="st-toggle-row__icon">
        <Icon name={icon} size={18} />
      </span>
      <div className="st-toggle-row__text">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        className={`st-switch${checked ? ' st-switch--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="st-switch__thumb" />
      </button>
    </div>
  );
}

function CardTitle({ icon, children }) {
  return (
    <div className="ad-card__head">
      <h3 className="st-card-title">
        <Icon name={icon} size={18} /> {children}
      </h3>
    </div>
  );
}


function AdminSettings() {
  const { admin, logoutAdmin, updateAdmin } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text }
  const noticeTimer = useRef(null);
  const nameInputRef = useRef(null);

  /* ---- profile form ---- */
  const initialProfile = useMemo(
    () => ({
      name: admin?.name || 'Administrator',
      email: admin?.email || '',
      phone: admin?.phone || '',
      location: admin?.location || '',
    }),
    [admin?.name, admin?.email, admin?.phone, admin?.location]
  );
  const [profile, setProfile] = useState(initialProfile);
  const [profileErrors, setProfileErrors] = useState({});
  const [savedProfile, setSavedProfile] = useState(initialProfile);

  const [savingProfile, setSavingProfile] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    setProfile(initialProfile);
    setSavedProfile(initialProfile);
  }, [initialProfile]);

  // load the saved admin details (name, phone, location, member-since) from the database
  useEffect(() => {
    let cancelled = false;
    api
      .get('/admin/me')
      .then((res) => {
        if (!cancelled) updateAdmin(res.data.data);
      })
      .catch(() => {
        /* keep showing whatever the login session already has */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- password form ---- */
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  /* ---- preferences ---- */
  const [prefs, setPrefs] = useState(loadPrefs);

  useEffect(() => {
    document.documentElement.dataset.theme = prefs.darkMode ? 'dark' : 'light';
    savePrefs(prefs);
  }, [prefs]);

  /* ---- notices ---- */
  const showNotice = useCallback((type, text) => {
    setNotice({ type, text });
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3500);
  }, []);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  /* ---- handlers ---- */
  const updateProfileField = (key) => (e) => {
    setProfile((p) => ({ ...p, [key]: e.target.value }));
    setProfileErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const updatePasswordField = (key) => (e) => {
    setPasswords((p) => ({ ...p, [key]: e.target.value }));
    setPasswordErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const setPref = (key) => (value) => setPrefs((p) => ({ ...p, [key]: value }));

  const profileDirty = JSON.stringify(profile) !== JSON.stringify(savedProfile);

  // saves the profile to MongoDB through PUT /api/admin/profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errors = validateProfile(profile);
    setProfileErrors(errors);
    if (Object.keys(errors).length) return;

    setSavingProfile(true);
    try {
      const res = await api.put('/admin/profile', profile);
      // updateAdmin also swaps in the fresh token the server sends back
      updateAdmin(res.data.data, res.data.token);
      showNotice('success', 'Profile updated successfully.');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not save your profile. Please try again.';
      if (err.response?.status === 409) setProfileErrors({ email: message });
      showNotice('error', message);
    } finally {
      setSavingProfile(false);
    }
  };

  // uploads the chosen photo to MongoDB through PUT /api/admin/profile-image
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be picked again later
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showNotice('error', 'Choose a PNG, JPG or WEBP photo.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showNotice('error', 'Photo must be under 2 MB.');
      return;
    }

    setPhotoBusy(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      // no manual Content-Type - the browser has to add the multipart boundary itself
      const res = await api.put('/admin/profile-image', formData);
      updateAdmin(res.data.data);
      showNotice('success', 'Profile photo updated.');
    } catch (err) {
      showNotice('error', err.response?.data?.message || 'Could not upload your photo. Please try again.');
    } finally {
      setPhotoBusy(false);
    }
  };

  // changes the password in MongoDB through PUT /api/admin/password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = validatePassword(passwords);
    setPasswordErrors(errors);
    if (Object.keys(errors).length) return;

    setSavingPassword(true);
    try {
      await api.put('/admin/password', {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPasswords({ current: '', next: '', confirm: '' });
      showNotice('success', 'Password updated successfully.');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not update your password. Please try again.';
      if (err.response?.status === 401) setPasswordErrors({ current: message });
      showNotice('error', message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleEdit = () => {
    setActiveTab('profile');
    // wait for the Profile tab to render before focusing
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate(ROUTES.login);
  };

  const displayName = profile.name || 'Administrator';

  const quickLinks = [
    { label: 'My Bookings', icon: 'calendar', onClick: () => navigate(ROUTES.bookings) },
    { label: 'Payment History', icon: 'payments', onClick: () => navigate(ROUTES.payments) },
    { label: 'Help & Support', icon: 'help', onClick: () => navigate(ROUTES.help) },
    { label: 'Logout', icon: 'logout', onClick: handleLogout },
  ];

  /* ---- sections (rendered per tab) ---- */
  const profileSection = (
    <section className="ad-card" aria-labelledby="st-profile-title">
      <CardTitle icon="user">
        <span id="st-profile-title">Profile Information</span>
      </CardTitle>

      <form className="st-profile" onSubmit={handleProfileSubmit} noValidate>
        <div className="st-profile__avatar">
          <AdminAvatar name={displayName} seed={profile.email || 'admin'} size={84} />
          <button
            type="button"
            className="st-profile__camera"
            aria-label="Change profile photo"
            onClick={() => photoInputRef.current?.click()}
            disabled={photoBusy}
          >
            <Icon name="camera" size={14} />
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handlePhotoChange}
            hidden
          />
        </div>

        <div className="st-form-grid">
          <Field id="st-name" label="Full Name" error={profileErrors.name}>
            <div className="st-input">
              <input
                id="st-name"
                ref={nameInputRef}
                type="text"
                value={profile.name}
                onChange={updateProfileField('name')}
                autoComplete="name"
              />
            </div>
          </Field>

          <Field id="st-email" label="Email Address" error={profileErrors.email}>
            <div className="st-input">
              <input
                id="st-email"
                type="email"
                value={profile.email}
                onChange={updateProfileField('email')}
                autoComplete="email"
              />
            </div>
          </Field>

          <Field id="st-phone" label="Phone Number" error={profileErrors.phone}>
            <div className="st-input">
              <input
                id="st-phone"
                type="tel"
                value={profile.phone}
                onChange={updateProfileField('phone')}
                placeholder="+91 00000 00000"
                autoComplete="tel"
              />
            </div>
          </Field>

          <Field id="st-location" label="Location" error={profileErrors.location}>
            <div className="st-input st-input--icon">
              <input
                id="st-location"
                type="text"
                value={profile.location}
                onChange={updateProfileField('location')}
                placeholder="City, State"
                autoComplete="address-level2"
              />
              <span className="st-input__adorn" aria-hidden="true">
                <Icon name="pin" size={16} />
              </span>
            </div>
          </Field>
        </div>

        <button type="submit" className="ad-btn st-btn st-btn--outline" disabled={!profileDirty || savingProfile}>
          <Icon name="edit" size={15} /> {savingProfile ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </section>
  );

  const notificationsSection = (
    <section className="ad-card" aria-labelledby="st-notify-title">
      <CardTitle icon="bell">
        <span id="st-notify-title">Notifications</span>
      </CardTitle>
      <div className="st-toggle-list">
        <ToggleRow
          icon="mail"
          title="Email Notifications"
          description="Receive updates about your bookings and offers"
          checked={prefs.emailNotifications}
          onChange={setPref('emailNotifications')}
        />
        <ToggleRow
          icon="phone"
          title="SMS Notifications"
          description="Get important alerts on your mobile"
          checked={prefs.smsNotifications}
          onChange={setPref('smsNotifications')}
        />
      </div>
    </section>
  );

  const preferencesSection = (
    <section className="ad-card" aria-labelledby="st-pref-title">
      <CardTitle icon="sliders">
        <span id="st-pref-title">App Preferences</span>
      </CardTitle>
      <div className="st-toggle-list">
        <ToggleRow
          icon="moon"
          title="Dark Mode"
          description="Switch between light and dark theme"
          checked={prefs.darkMode}
          onChange={setPref('darkMode')}
        />
        {activeTab === 'profile' && (
          <>
            <ToggleRow
              icon="mail"
              title="Email Notifications"
              description="Receive updates about your bookings and offers"
              checked={prefs.emailNotifications}
              onChange={setPref('emailNotifications')}
            />
            <ToggleRow
              icon="phone"
              title="SMS Notifications"
              description="Get important alerts on your mobile"
              checked={prefs.smsNotifications}
              onChange={setPref('smsNotifications')}
            />
          </>
        )}
      </div>
    </section>
  );

  const passwordSection = (
    <section className="ad-card" aria-labelledby="st-pass-title">
      <CardTitle icon="lock">
        <span id="st-pass-title">Change Password</span>
      </CardTitle>
      <form className="st-password" onSubmit={handlePasswordSubmit} noValidate>
        <PasswordField
          id="st-current"
          label="Current Password"
          value={passwords.current}
          onChange={updatePasswordField('current')}
          placeholder="Enter current password"
          error={passwordErrors.current}
          autoComplete="current-password"
        />
        <PasswordField
          id="st-new"
          label="New Password"
          value={passwords.next}
          onChange={updatePasswordField('next')}
          placeholder="Enter new password"
          error={passwordErrors.next}
          autoComplete="new-password"
        />
        <PasswordField
          id="st-confirm"
          label="Confirm Password"
          value={passwords.confirm}
          onChange={updatePasswordField('confirm')}
          placeholder="Confirm new password"
          error={passwordErrors.confirm}
          autoComplete="new-password"
        />
        <button type="submit" className="ad-btn st-btn st-btn--primary st-btn--block" disabled={savingPassword}>
          <Icon name="lock" size={15} /> {savingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </section>
  );

  const sessionSection = (
    <section className="ad-card">
      <CardTitle icon="logout">Session</CardTitle>
      <p className="st-note">
        Signing out ends this admin session on this device. You&apos;ll need to log in again to manage RideNow.
      </p>
      <button type="button" className="ad-btn ad-btn--danger" onClick={handleLogout}>
        <Icon name="logout" size={16} /> Log out
      </button>
    </section>
  );

  const tabContent = {
    profile: (
      <>
        {profileSection}
        {preferencesSection}
      </>
    ),
    notifications: notificationsSection,
    security: sessionSection,
    preferences: preferencesSection,
  };

  // Change Password sits in the second column on the Profile and Security tabs.
  const showPassword = activeTab === 'profile' || activeTab === 'security';

  return (
    <div className="st-page">
      <PageHeader
        icon="settings"
        title="Settings"
        subtitle="Manage your account preferences and system settings."
      />

      {notice && (
        <div className={`st-toast st-toast--${notice.type}`} role="status" aria-live="polite">
          <Icon name={notice.type === 'success' ? 'check' : 'info'} size={16} />
          {notice.text}
        </div>
      )}

      <div className="st-layout">
        {/* ------------------------- main column ------------------------- */}
        <div className="st-main">
          <div className="st-tabs" role="tablist" aria-label="Settings sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`st-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls="st-tabpanel"
                className={`st-tab${activeTab === tab.id ? ' st-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon name={tab.icon} size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div
            id="st-tabpanel"
            role="tabpanel"
            aria-labelledby={`st-tab-${activeTab}`}
            className={`st-panel${showPassword ? ' st-panel--split' : ''}`}
          >
            <div className="st-panel__col">{tabContent[activeTab]}</div>
            {showPassword && <div className="st-panel__col">{passwordSection}</div>}
          </div>
        </div>

        {/* ------------------------- side column ------------------------- */}
        <aside className="st-side">
          <section className="ad-card st-summary">
            <div className="st-summary__top">
              <AdminAvatar name={displayName} seed={profile.email || 'admin'} size={52} />
              <div className="st-summary__id">
                <strong>{displayName}</strong>
                <span>{profile.email || '—'}</span>
              </div>
              <button type="button" className="st-summary__edit" onClick={handleEdit}>
                <Icon name="edit" size={14} /> Edit
              </button>
            </div>

            <ul className="st-facts">
              <li>
                <span className="st-facts__icon"><Icon name="phone" size={16} /></span>
                <div>
                  <small>Phone</small>
                  <strong>{profile.phone || '—'}</strong>
                </div>
              </li>
              <li>
                <span className="st-facts__icon"><Icon name="pin" size={16} /></span>
                <div>
                  <small>Location</small>
                  <strong>{profile.location || '—'}</strong>
                </div>
              </li>
              <li>
                <span className="st-facts__icon"><Icon name="calendar" size={16} /></span>
                <div>
                  <small>Member Since</small>
                  <strong>{formatMemberSince(admin?.createdAt)}</strong>
                </div>
              </li>
            </ul>
          </section>

          <section className="ad-card st-links">
            <CardTitle icon="link">Quick Links</CardTitle>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button type="button" className="st-link" onClick={link.onClick}>
                    <span className="st-link__icon"><Icon name={link.icon} size={16} /></span>
                    <span className="st-link__label">{link.label}</span>
                    <Icon name="chevron-right" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default AdminSettings;