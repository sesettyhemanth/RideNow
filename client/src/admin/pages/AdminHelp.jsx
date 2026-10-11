import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import '../styles/AdminTheme.css';
import '../styles/AdminSettings.css'; 
import '../styles/AdminHelp.css';


const SUPPORT = {
  email: 'sesettyhemanth74@gmail.com',
  phone: '+91 9346539195',
  hours: 'Mon - Sat, 9:00 AM - 7:00 PM IST',
};

const FAQS = [
  {
    q: 'How do I verify a booking with the QR code?',
    a: 'Click "Scan QR" in the top bar and point the camera at the renter\'s booking QR code. The booking opens on a verification page where you can check the renter, license status and vehicle. If the camera is not available, type the booking code (for example BK1A2B3) in the box under the camera.',
  },
  {
    q: 'What do the booking buttons mean?',
    a: 'A new booking shows "Mark Picked Up" and "Cancel Booking". Click "Mark Picked Up" when the renter collects the vehicle. After that, "Mark Completed" appears - click it when the vehicle is returned. A finished booking shows a green "Completed" button.',
  },
  {
    q: 'Why does a vehicle show as Rented?',
    a: 'A vehicle becomes Rented as soon as someone books it and goes back to Available when the booking is completed or cancelled. Vehicles you set to Maintenance are never changed by bookings.',
  },
  {
    q: 'How do I add or edit a vehicle?',
    a: 'Open Manage Vehicles and click "Add Vehicle", or click "Edit" on a row. Fill in the details and add up to 5 photos (PNG, JPG or WEBP) from different angles. You can also use the row menu to send a vehicle to maintenance or mark it available.',
  },
  {
    q: 'How do I change my password or profile photo?',
    a: 'Go to Settings. Use "Change Password" and enter your current password, then the new one (at least 8 characters). To change your photo, click the camera button on your picture in the Profile tab.',
  },
  {
    q: 'I cannot see the camera when scanning.',
    a: 'Allow camera access in your browser. The site must be opened over HTTPS (or localhost) for the camera to work. You can always type the booking code instead.',
  },
];

const GUIDE_LINKS = [
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/vehicles', label: 'Manage Vehicles' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/settings', label: 'Settings' },
];

function Svg({ size = 18, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const HelpIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);
const MailIcon = (props) => (
  <Svg {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </Svg>
);
const PhoneIcon = (props) => (
  <Svg {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);
const ClockIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Svg>
);
const ChevronRight = (props) => (
  <Svg {...props}>
    <polyline points="9 18 15 12 9 6" />
  </Svg>
);
const BookIcon = (props) => (
  <Svg {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Svg>
);


function AdminHelp() {
  return (
    <div className="st-page hp-page">
      <PageHeader
        title="Help & Support"
        subtitle="Quick answers for managing RideNow, and how to reach us."
        actions={
          <Link to="/admin/settings" className="ad-btn">
            Back to Settings
          </Link>
        }
      />

      <div className="st-layout">
        {/* ------------------------- FAQ column ------------------------- */}
        <div className="st-main">
          <section className="ad-card" aria-labelledby="hp-faq-title">
            <div className="ad-card__head">
              <h3 className="st-card-title">
                <HelpIcon /> <span id="hp-faq-title">Frequently Asked Questions</span>
              </h3>
            </div>

            <div className="hp-faq">
              {FAQS.map((item) => (
                <details key={item.q} className="hp-faq__item">
                  <summary>
                    <span>{item.q}</span>
                    <span className="hp-faq__chev">
                      <ChevronRight size={16} />
                    </span>
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* ------------------------- side column ------------------------- */}
        <aside className="st-side">
          <section className="ad-card hp-contact">
            <div className="ad-card__head">
              <h3 className="st-card-title">
                <MailIcon /> Contact Support
              </h3>
            </div>
            <ul className="hp-contact__list">
              <li>
                <span className="st-facts__icon">
                  <MailIcon size={16} />
                </span>
                <div>
                  <small>Email</small>
                  <a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a>
                </div>
              </li>
              <li>
                <span className="st-facts__icon">
                  <PhoneIcon size={16} />
                </span>
                <div>
                  <small>Phone</small>
                  <a href={`tel:${SUPPORT.phone.replace(/\s+/g, '')}`}>{SUPPORT.phone}</a>
                </div>
              </li>
              <li>
                <span className="st-facts__icon">
                  <ClockIcon size={16} />
                </span>
                <div>
                  <small>Support hours</small>
                  <strong>{SUPPORT.hours}</strong>
                </div>
              </li>
            </ul>
            <a className="ad-btn st-btn st-btn--primary st-btn--block hp-contact__btn" href={`mailto:${SUPPORT.email}`}>
              <MailIcon size={15} /> Email Support
            </a>
          </section>

          <section className="ad-card st-links">
            <div className="ad-card__head">
              <h3 className="st-card-title">
                <BookIcon /> Go to
              </h3>
            </div>
            <ul>
              {GUIDE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="st-link hp-link">
                    <span className="st-link__label">{link.label}</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default AdminHelp;