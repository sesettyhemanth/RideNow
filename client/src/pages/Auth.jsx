// SAVE THIS AS: client/src/pages/Auth.jsx  (replace the old file)
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import GoogleLoginButton from '../components/GoogleLoginButton.jsx';
import logo from '../assets/logo.png'; // same logo used in the Navbar
import hero from '../assets/hero.png'; // car, bike and scooter
import '../styles/Auth.css';

/* ------------------------------------------------------------------ */
/* Inline SVG icons (stroke based, inherit colour via currentColor)    */
/* ------------------------------------------------------------------ */
const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

const ShieldIcon = () => (
  <svg {...iconProps}>
    <path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const TagIcon = () => (
  <svg {...iconProps}>
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
    <circle cx="7.5" cy="7.5" r="1.2" />
  </svg>
);

const CalendarIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

const HeadsetIcon = () => (
  <svg {...iconProps}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="2.5" y="14" width="4.5" height="6" rx="1.5" />
    <rect x="17" y="14" width="4.5" height="6" rx="1.5" />
    <path d="M19.5 20c0 1.2-1.5 2-4 2h-2" />
  </svg>
);

const EyeIcon = () => (
  <svg {...iconProps}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg {...iconProps}>
    <path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-6.4 0-10-7-10-7a17.6 17.6 0 0 1 4.1-4.9" />
    <path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-2.2 3.2" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m2 2 20 20" />
  </svg>
);

const BADGES = [
  { Icon: ShieldIcon, label: 'Safe & Secure Rides' },
  { Icon: TagIcon, label: 'Best Price Guaranteed' },
  { Icon: CalendarIcon, label: 'Easy Online Booking' },
  { Icon: HeadsetIcon, label: '24/7 Customer Support' },
];

const EMPTY_LOGIN = { email: '', password: '' };
const EMPTY_SIGNUP = { name: '', email: '', phone: '', password: '' };

/* ------------------------------------------------------------------ */
/* Reusable password input with show / hide toggle                     */
/* ------------------------------------------------------------------ */
function PasswordInput({ id, name, value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Left brand panel (static, mirrors the approved design)              */
/* ------------------------------------------------------------------ */
function BrandPanel() {
  return (
    <aside className="auth-intro">
      <div className="auth-intro-content">
        <Link to="/" className="auth-logo" aria-label="RideNow home">
          <img src={logo} alt="" className="auth-logo-img" />
          <span className="auth-logo-copy">
            <span className="logo-text">
              Ride<span className="logo-accent">Now</span>
            </span>
            <span className="auth-tagline">Cars &bull; Bikes &bull; Scooters</span>
          </span>
        </Link>

        <h1>
          <span className="auth-title-line">Join RideNow</span>
          <span className="highlight">for a Better Ride</span>
        </h1>

        <p className="auth-description">
          Book your favourite cars, bikes or scooters in just a few clicks. Safe,
          affordable and always on time.
        </p>

        <ul className="auth-badges">
          {BADGES.map(({ Icon, label }) => (
            <li key={label}>
              <span className="badge-icon">
                <Icon />
              </span>
              <span className="badge-label">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="auth-hero">
        <img
          className="auth-hero-img"
          src={hero}
          alt="A motorbike, a car and a scooter available to rent on RideNow"
          loading="lazy"
        />
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
function Auth({ mode: modeProp }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { loginUser, loginAdmin, logoutUser, logoutAdmin } = useApp();

  // mode comes from the prop if given, otherwise from the URL (/signup => signup)
  const mode = modeProp || (pathname.startsWith('/signup') ? 'signup' : 'login');
  const isLogin = mode === 'login';
  const redirectTo = searchParams.get('redirect') || '/';

  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [signupForm, setSignupForm] = useState(EMPTY_SIGNUP);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // clear messages when switching between login and signup
  useEffect(() => {
    setError('');
    setLoading(false);
  }, [mode]);

  const handleLoginChange = (e) =>
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSignupChange = (e) =>
    setSignupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ---------------------------- login ---------------------------- */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // try admin login first - only the real admin email/password will ever match
      try {
        const adminRes = await api.post('/admin/login', loginForm);
        logoutUser(); // never keep a user login next to an admin login
        loginAdmin(adminRes.data.admin, adminRes.data.token);
        navigate('/admin');
        return;
      } catch (err) {
        // 401 = not an admin, so try the normal user login below.
        // Anything else (no connection, server error) is a real problem, so show it.
        if (err.response?.status !== 401) {
          setError(
            err.response?.data?.message || 'Cannot reach the server. Check the API URL and try again.'
          );
          return;
        }
      }

      const userRes = await api.post('/auth/login', loginForm);
      logoutAdmin(); // never keep an admin login next to a user login
      loginUser(userRes.data.data, userRes.data.token);
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------- signup --------------------------- */
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('Please agree to the Terms & Conditions');
      return;
    }

    try {
      setLoading(true);
      const { name, email, phone, password } = signupForm;
      const res = await api.post('/auth/signup', { name, email, phone, password });
      logoutAdmin();
      loginUser(res.data.data, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------- google --------------------------- */
  const handleGoogleCredential = useCallback(
    async (credential) => {
      setError('');
      setLoading(true);

      try {
        const res = await api.post('/auth/google', { credential });
        logoutAdmin();
        loginUser(res.data.data, res.data.token);
        navigate(isLogin ? redirectTo : '/');
      } catch (err) {
        setError(
          err.response?.data?.message ||
            `Could not ${isLogin ? 'sign in' : 'sign up'} with Google. Please try again.`
        );
      } finally {
        setLoading(false);
      }
    },
    [isLogin, loginUser, logoutAdmin, navigate, redirectTo]
  );

  return (
    <section className="auth-page">
      <div className="auth-layout">
        <BrandPanel />

        {/* ------------------------ right: form -------------------------- */}
        <div className="auth-card card">
          <h2>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
          <p className="auth-subtitle">
            {isLogin
              ? 'Login to continue renting with RideNow.'
              : 'Sign up to start your journey with RideNow'}
          </p>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <PasswordInput
                  id="login-password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                />
              </div>

              {error && (
                <p className="error-text" role="alert">
                  {error}
                </p>
              )}

              <button className="btn btn-accent btn-block" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Full Name"
                  value={signupForm.name}
                  onChange={handleSignupChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">Email Address</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  value={signupForm.email}
                  onChange={handleSignupChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-phone">Phone Number</label>
                <input
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Phone Number"
                  value={signupForm.phone}
                  onChange={handleSignupChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <PasswordInput
                  id="signup-password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Password"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                />
              </div>

              <label className="terms-check">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>I agree to the Terms &amp; Conditions and Privacy Policy</span>
              </label>

              {error && (
                <p className="error-text" role="alert">
                  {error}
                </p>
              )}

              <button className="btn btn-accent btn-block" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up →'}
              </button>
            </form>
          )}

          {/* Google sign-in is only offered on the login side, below the form */}
          {isLogin && (
            <>
              <div className="auth-divider">
                <span>or login with Google</span>
              </div>

              <div className="google-login-wrapper">
                <GoogleLoginButton onCredential={handleGoogleCredential} />
              </div>
            </>
          )}

          <p className="auth-switch">
            {isLogin ? (
              <>
                Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
              </>
            ) : (
              <>
                Already have an account? <Link to="/login">Log In</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

export default Auth;