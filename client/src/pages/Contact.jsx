import React, { useState } from 'react';
import '../styles/Contact.css';
import heroImg from '../assets/hero.png';

const OFFICE_COORDS = '17.801205, 83.215256';
const ADDRESS_LINE_1 = '7-115, Pendurthi,';
const ADDRESS_LINE_2 = 'Visakhapatnam, Andhra Pradesh - 531173';

const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(OFFICE_COORDS)}&z=16&output=embed`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(OFFICE_COORDS)}`;

/* ---------- Inline SVG icons (stroke uses currentColor) ---------- */
const Svg = ({ children, size = 20, ...rest }) => (
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
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
);

const BoltIcon = (p) => (
  <Svg {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </Svg>
);
const ShieldIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);
const UsersIcon = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M17 14.5c2.4 0 4 1.7 4 4.5" />
  </Svg>
);
const PhoneIcon = (p) => (
  <Svg {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </Svg>
);
const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);
const PinIcon = (p) => (
  <Svg {...p}>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);
const WhatsAppIcon = (p) => (
  <Svg {...p}>
    <path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.6L3 21z" />
    <path d="M9 9c.3 2.2 2.8 4.7 5 5l1.3-1.3-2-1-.8.8c-.8-.4-1.6-1.2-2-2l.8-.8-1-2L9 9z" />
  </Svg>
);
const UserIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </Svg>
);
const ChatIcon = (p) => (
  <Svg {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
    <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeWidth="2.6" />
  </Svg>
);
const SendIcon = (p) => (
  <Svg {...p}>
    <path d="M21 3 10 14" />
    <path d="M21 3l-7 18-4-7-7-4 18-7z" />
  </Svg>
);
const MapIcon = (p) => (
  <Svg {...p}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </Svg>
);

/* ---------- Data ---------- */
const highlights = [
  { Icon: BoltIcon, title: 'Quick Response', text: 'Within 24 hours' },
  { Icon: ShieldIcon, title: 'Trusted Support', text: 'Your safety matters' },
  { Icon: UsersIcon, title: 'Friendly Team', text: 'Always here for you' },
];

const contactDetails = [
  {
    Icon: PhoneIcon,
    title: 'Phone',
    lines: ['+91 9346539195'],
    note: 'Mon - Sun, 8:00 AM - 10:00 PM',
  },
  {
    Icon: MailIcon,
    title: 'Email',
    lines: ['sesettyhemanth74@gmail.com'],
    note: 'We reply within 24 hours',
  },
  {
    Icon: PinIcon,
    title: 'Address',
    lines: [ADDRESS_LINE_1, ADDRESS_LINE_2],
  },
  {
    Icon: WhatsAppIcon,
    title: 'WhatsApp',
    lines: ['+91 9346539195'],
    note: 'Chat with us directly',
  },
];

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (sent) setSent(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // this is just a contact form for now, no backend endpoint is wired up to it yet
    setSent(true);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section className="contact-page">
      {/* ---------- Hero ---------- */}
      <div className="contact-hero">
        <div className="container contact-hero-inner">
          <div className="contact-hero-text">
            <span className="section-label">Get In Touch</span>
            <h1>
              We’re Here to <span className="highlight">Help You!</span>
            </h1>
            <p className="contact-intro">
              Have questions, feedback, or need assistance? Our team is always ready to help.
              Reach out to us and we’ll get back to you as soon as possible.
            </p>

            <ul className="contact-highlights">
              {highlights.map(({ Icon, title, text }) => (
                <li key={title}>
                  <span className="highlight-icon">
                    <Icon size={18} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* hero.png should include the skyline + "Ride Safe, Stay Happy" tagline */}
        <img
          className="contact-hero-img"
          src={heroImg}
          alt="Bike, car and scooter in front of a sunlit city skyline - Ride Safe, Stay Happy"
        />
      </div>

      {/* ---------- Main grid ---------- */}
      <div className="container contact-layout">
        {/* Contact info */}
        <div className="contact-info">
          <h2>Contact Information</h2>
          <p className="contact-info-sub">
            You can reach us through the following details or visit our office location.
          </p>

          {contactDetails.map(({ Icon, title, lines, note }) => (
            <div className="info-row" key={title}>
              <span className="info-icon">
                <Icon size={20} />
              </span>
              <div>
                <h4>{title}</h4>
                {lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {note && <span className="info-note">{note}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Send Us a Message</h3>
          <p>Fill out the form below and we’ll get back to you soon.</p>

          <label className="field">
            <UserIcon size={16} />
            <input
              name="name"
              placeholder="Your Name *"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <MailIcon size={16} />
            <input
              name="email"
              type="email"
              placeholder="Your Email *"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <PhoneIcon size={16} />
            <input
              name="phone"
              type="tel"
              placeholder="Your Phone Number *"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field field-textarea">
            <ChatIcon size={16} />
            <textarea
              name="message"
              placeholder="Your Message *"
              rows="4"
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>

          {/* No global btn classes here - they were turning the button blue */}
          <button className="send-btn" type="submit">
            <SendIcon size={16} />
            Send Message
          </button>

          {sent && (
            <p className="success-text" role="status">
              Thanks! Your message has been sent.
            </p>
          )}
        </form>

        {/* Map + office */}
        <aside className="contact-side">
          <div className="map-card">
            <iframe
              title="RideNow office location on Google Maps"
              src={MAP_EMBED_URL}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="office-card">
            <span className="info-icon pin">
              <PinIcon size={20} />
            </span>
            <div>
              <h4>Visit Our Office</h4>
              <p>{ADDRESS_LINE_1}</p>
              <p>{ADDRESS_LINE_2}</p>
              <a
                className="directions-btn"
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapIcon size={14} />
                Get Directions
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Contact;