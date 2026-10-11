import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';

import heroImage from '../assets/auth.png';
import bikeImg from '../assets/bike.png';
import scooterImg from '../assets/scooter.png';
import carImg from '../assets/car.png';

/* ---------- inline SVG icons ---------- */
const Svg = ({ children, size = 20, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

const Icon = {
  pin: (p) => (
    <Svg {...p}>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Svg>
  ),
  shield: (p) => (
    <Svg {...p}>
      <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </Svg>
  ),
  tag: (p) => (
    <Svg {...p}>
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <circle cx="7.5" cy="8.5" r="1.2" />
    </Svg>
  ),
  calendar: (p) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  ),
  headset: (p) => (
    <Svg {...p}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4" height="6" rx="1.5" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" />
      <path d="M19 20c0 1.2-1.5 2-4 2h-2" />
    </Svg>
  ),
  arrowRight: (p) => (
    <Svg {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  ),
  chevronRight: (p) => (
    <Svg {...p}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  ),
  chevronDown: (p) => (
    <Svg {...p}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  ),
  car: (p) => (
    <Svg {...p}>
      <path d="M5 16V11l2-5h10l2 5v5" />
      <path d="M3 16h18v3H3zM5 11h14" />
      <circle cx="7.5" cy="16" r="0.6" />
      <circle cx="16.5" cy="16" r="0.6" />
    </Svg>
  ),
  swap: (p) => (
    <Svg {...p}>
      <path d="M4 8h15l-3-3M20 16H5l3 3" />
    </Svg>
  ),
  clock: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  ),
  scooter: (p) => (
    <Svg {...p}>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M9 17h6l-2-8h-3M16 5h3l-1 6" />
    </Svg>
  ),
  search: (p) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </Svg>
  ),
  users: (p) => (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.5c1.9.8 3 2.7 3 5.5" />
    </Svg>
  ),
  star: (p) => (
    <Svg {...p}>
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
    </Svg>
  ),
  rupee: (p) => (
    <Svg {...p}>
      <path d="M7 5h10M7 9.5h10M8 5c4.6 0 6.2 1.8 6.2 4.2S12.6 13.5 8 13.5h-.5l8 6.5" />
    </Svg>
  ),
  wallet: (p) => (
    <Svg {...p}>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 10h18M16 15h2" />
    </Svg>
  ),
  check: (p) => (
    <Svg {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  ),
  bolt: (p) => (
    <Svg {...p}>
      <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />
    </Svg>
  ),
};

/* unified icon: yellow circle + dark glyph, same look everywhere */
const IconBadge = ({ name, size = 18, className = '' }) => (
  <span className={`icon-badge ${className}`}>{Icon[name]({ size })}</span>
);

const vehicleOptions = [
  { value: '', label: 'All Vehicles' },
  { value: 'bike', label: 'Bikes' },
  { value: 'scooter', label: 'Scooters' },
  { value: 'car', label: 'Cars' },
];

const VehicleSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = vehicleOptions.find((o) => o.value === value) || vehicleOptions[0];

  // close when clicking outside or pressing Escape
  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`search-field select-field${open ? ' open' : ''}`}
      onClick={() => setOpen((o) => !o)}
    >
      <IconBadge name="scooter" size={20} className="field" />
      <div className="field-body">
        <span className="field-label">Vehicle Type</span>
        <button
          type="button"
          className="select-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selected.label}
        </button>
      </div>
      <span className="field-chevron">{Icon.chevronDown({ size: 16 })}</span>

      {open && (
        <ul
          className="select-menu"
          role="listbox"
          onClick={(e) => e.stopPropagation()}
        >
          {vehicleOptions.map((o) => (
            <li
              key={o.value || 'all'}
              role="option"
              aria-selected={o.value === value}
              className={`select-option${o.value === value ? ' selected' : ''}`}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <span>{o.label}</span>
              {o.value === value && Icon.check({ size: 16 })}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ---------- data ---------- */
const rideTypes = [
  {
    type: 'bike',
    title: 'Bikes',
    desc: 'Perfect for quick rides and daily commutes.',
    bg: '#fdf3d4',
    btn: '#f5a300',
    img: bikeImg,
  },
  {
    type: 'scooter',
    title: 'Scooters',
    desc: 'Light, easy & fuel-efficient for city rides.',
    bg: '#e5f4e8',
    btn: '#2e9e5b',
    img: scooterImg,
  },
  {
    type: 'car',
    title: 'Cars',
    desc: 'Comfortable rides for short or long journeys.',
    bg: '#fdeadb',
    btn: '#ee6c2b',
    img: carImg,
  },
];

const heroBadges = [
  { icon: 'shield', text: 'Safe & Secure Rides' },
  { icon: 'tag', text: 'Best Price Guaranteed' },
  { icon: 'calendar', text: 'Easy Online Booking' },
  { icon: 'headset', text: '24/7 Customer Support' },
];

const stats = [
  { icon: 'users', value: '50,000+', label: 'Happy Customers' },
  { icon: 'car', value: '15,000+', label: 'Vehicles on Rent' },
  { icon: 'pin', value: '100+', label: 'Cities Covered' },
  { icon: 'star', value: '4.8', label: 'Customer Rating' },
];

const whyChooseUs = [
  { icon: 'rupee', title: 'Affordable Prices', desc: 'Best prices for every budget.' },
  { icon: 'calendar', title: 'Easy Booking', desc: 'Book your ride in just a few clicks.' },
  { icon: 'shield', title: 'Flexible Rentals', desc: 'Hourly, daily or monthly rental options.' },
  { icon: 'headset', title: 'All India Support', desc: "We're here to help you anytime." },
  { icon: 'bolt', title: 'Hassle Free', desc: 'No hidden charges and easy returns.' },
  { icon: 'shield', title: 'Verified Vehicles', desc: 'All vehicles are verified & insured.' },
];

function Home() {
  const navigate = useNavigate();
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (vehicleType) params.set('type', vehicleType);
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="home">
      {/* hero section */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="section-label">
              <IconBadge name="pin" size={18} className="strong" /> Your Ride &bull; Your Way
            </span>
            <h1>
              Rent Your Ride
              <br />
              <span className="highlight">Bikes,</span> Cars &amp;{' '}
              <span className="highlight">Scooters</span>
            </h1>
            <p>
              Easy, affordable and reliable vehicle rentals for your daily commute,
              weekend trips or special plans. Choose from a wide range of bikes,
              scooters and cars all in one place.
            </p>
            <Link to="/vehicles" className="btn btn-accent">
              Explore Vehicles {Icon.arrowRight({ size: 16 })}
            </Link>

            <div className="hero-badges">
              {heroBadges.map((b) => (
                <div className="hero-badge" key={b.text}>
                  <IconBadge name={b.icon} size={18} />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-image">
            <img src={heroImage} alt="Bike, car and scooter available for rent" />
          </div>
        </div>

        <div className="container">
          <div className="search-wrap">
            <form className="search-box" onSubmit={handleSearch}>
              <div className="search-field">
                <IconBadge name="calendar" size={20} className="field" />
                <div className="field-body">
                  <label>Pick-up Date</label>
                  <input
                    type="date"
                    placeholder="Select date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="search-field">
                <IconBadge name="clock" size={20} className="field" />
                <div className="field-body">
                  <label>Pick-up Time</label>
                  <input
                    type="time"
                    placeholder="Select time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                  />
                </div>
              </div>
              <VehicleSelect value={vehicleType} onChange={setVehicleType} />
              <button type="submit" className="btn btn-primary">
                {Icon.search({ size: 18 })} Search Vehicles
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* choose your ride */}
      <section className="container ride-types">
        <div className="section-head">
          <h2>Choose Your Ride</h2>
          <Link to="/vehicles" className="view-all">
            View All Vehicles {Icon.arrowRight({ size: 14 })}
          </Link>
        </div>
        <div className="ride-types-grid">
          {rideTypes.map((item) => (
            <Link
              key={item.type}
              to={`/vehicles?type=${item.type}`}
              className="ride-type-card"
              style={{ backgroundColor: item.bg }}
            >
              <div className="ride-type-text">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <span
                  className="ride-type-link"
                  style={{ color: item.btn, borderColor: item.btn }}
                >
                  Explore {item.title}
                </span>
              </div>
              <img className="ride-type-img" src={item.img} alt={item.title} />
            </Link>
          ))}
        </div>
      </section>

      {/* why choose us */}
      <section className="container why-us">
        <h2>Why Choose RideNow?</h2>
        <div className="why-us-grid">
          {whyChooseUs.map((item) => (
            <div key={item.title} className="why-us-card">
              <IconBadge name={item.icon} size={22} className="lg" />
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;