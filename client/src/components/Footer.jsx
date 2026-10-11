import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import '../styles/Footer.css';

/* ---------- Static data ---------- */

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Contact', to: '/contact' },
];

const SERVICES = [
  { label: 'Bike Rental', to: '/vehicles?type=bike' },
  { label: 'Scooter Rental', to: '/vehicles?type=scooter' },
  { label: 'Car Rental', to: '/vehicles?type=car' },
  { label: 'One Way Trip', to: '/vehicles?plan=one-way' },
];

/* ---------- SVG icons ---------- */

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': 'true',
  focusable: 'false',
};

const FacebookIcon = () => (
  <svg {...iconProps}>
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" />
  </svg>
);

const InstagramIcon = () => (
  <svg {...iconProps}>
    <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9zM12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4zm4.7-2.5a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1z" />
  </svg>
);

const XIcon = () => (
  <svg {...iconProps}>
    <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.3 4.7H5.5l11.2 14.5z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg {...iconProps}>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />
  </svg>
);

const LocationIcon = () => (
  <svg {...iconProps}>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
  </svg>
);

const PhoneIcon = () => (
  <svg {...iconProps}>
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1l-2.2 2.2z" />
  </svg>
);

const MailIcon = () => (
  <svg {...iconProps}>
    <path d="M3 5h18a1 1 0 0 1 1 1v.5l-10 6.2L2 6.5V6a1 1 0 0 1 1-1zm19 4.1V18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9.1l9.5 5.9a1 1 0 0 0 1 0L22 9.1z" />
  </svg>
);

const ClockIcon = () => (
  <svg {...iconProps}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.8-13h-1.6v6l5 3 .8-1.3-4.2-2.5V7z" />
  </svg>
);

/* ---------- Data that depends on icons ---------- */

const SOCIALS = [
  { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
  { label: 'X (Twitter)', href: 'https://x.com', Icon: XIcon },
  { label: 'YouTube', href: 'https://youtube.com', Icon: YouTubeIcon },
];

const CONTACTS = [
  {
    Icon: LocationIcon,
    lines: ['7-115, Pendurthi,', 'Visakhapatnam, Andhra Pradesh - 531173'],
  },
  { Icon: PhoneIcon, lines: ['+91 9346539195'], href: 'tel:+919346539195' },
  {
    Icon: MailIcon,
    lines: ['sesettyhemanth74@gmail.com'],
    href: 'mailto:sesettyhemanth74@gmail.com',
  },
];

/* ---------- Component ---------- */

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Brand */}
        <section className="footer__brand">
          <Link to="/" className="footer__brand-link" aria-label="RideEasy home">
            <img
              src={logo}
              alt="RideEasy logo"
              className="footer__logo"
              width="106"
              height="106"
              loading="lazy"
            />
            <span className="footer__brand-text">
              <span className="footer__brand-name">
                Ride<span className="footer__brand-accent">Easy</span>
              </span>
              <span className="footer__brand-sub">Bike • Scooter • Car Rental</span>
            </span>
          </Link>

          <p className="footer__tagline">
            Your journey, our wheels. Rent bikes, scooters and cars anytime,
            anywhere.
          </p>

          <ul className="footer__socials">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="footer__social"
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Quick links */}
        <nav className="footer__col" aria-label="Quick links">
          <h4 className="footer__heading">Quick Links</h4>
          <ul className="footer__list">
            {QUICK_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="footer__link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Services */}
        <nav className="footer__col" aria-label="Our services">
          <h4 className="footer__heading">Our Services</h4>
          <ul className="footer__list">
            {SERVICES.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="footer__link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <section className="footer__col">
          <h4 className="footer__heading">Contact Us</h4>
          <ul className="footer__contact">
            {CONTACTS.map(({ Icon, lines, href }) => (
              <li key={lines[0]} className="footer__contact-item">
                <span className="footer__contact-icon">
                  <Icon />
                </span>
                {href ? (
                  <a href={href} className="footer__contact-text">
                    {lines[0]}
                  </a>
                ) : (
                  <span className="footer__contact-text">
                    {lines.map((line) => (
                      <span key={line} className="footer__contact-line">
                        {line}
                      </span>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="footer__bottom">
        <p>© {year} RideNow. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;