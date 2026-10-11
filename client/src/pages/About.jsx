import React from 'react';
import '../styles/About.css';

import heroImg from '../assets/hero.png';
import storyImage from '../assets/about.png';

const iconPaths = {
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  rupee: (
    <>
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="m6 13 8.5 8" />
      <path d="M6 13h3" />
      <path d="M9 13c6.667 0 6.667-10 0-10" />
    </>
  ),
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  headset: (
    <>
      <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
      <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  heart: (
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  ),
  mapPin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  scooter: (
    <>
      <circle cx="5.5" cy="17.5" r="3" />
      <circle cx="18.5" cy="17.5" r="3" />
      <path d="M8.5 17.5h5.2a2 2 0 0 0 1.9-1.4L17 11" />
      <path d="M15 6h3l-1.2 5" />
      <path d="M5 12h5" />
    </>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
};

function Icon({ name, size = 22 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
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
      {iconPaths[name]}
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="10" fill="#ffc61a" />
      <path
        d="m5.8 10.4 2.7 2.7 5.7-5.9"
        fill="none"
        stroke="#0f1b3d"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Data ---------- */
const features = [
  { icon: 'rupee', lines: ['Affordable', 'Pricing'] },
  { icon: 'shield', lines: ['Safe & Reliable', 'Vehicles'] },
  { icon: 'headset', lines: ['24/7 Customer', 'Support'] },
];

const values = [
  'Customer First',
  'Safety Always',
  'Transparency',
  'Sustainability',
  'Innovation',
];

const stats = [
  { icon: 'users', number: '10K+', label: 'Happy Customers' },
  { icon: 'mapPin', number: '50+', label: 'Cities Covered' },
  { icon: 'scooter', number: '2K+', label: 'Vehicles Available' },
  { icon: 'star', number: '4.8/5', label: 'Average Rating' },
];

function About() {
  return (
    <div className="about-page">
      {/* ================= HERO ================= */}
      <section className="about-hero">
        <div className="container about-hero-inner">
          <div className="about-hero-text">
            <span className="about-badge">
              <span className="about-badge-icon">
                <Icon name="users" size={16} />
              </span>
              About RideNow
            </span>

            <h1>
              We're More Than <span className="highlight">Just a Ride</span>
            </h1>

            <p>
              RideNow is your trusted partner for quick, easy and affordable bike and
              scooter rentals. We believe in the freedom of movement and the joy of
              exploring new places on your own terms.
            </p>

            <div className="about-features">
              {features.map((item) => (
                <div key={item.lines.join(' ')} className="about-feature">
                  <span className="about-icon-circle">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="about-feature-text">
                    {item.lines[0]}
                    <br />
                    {item.lines[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="about-hero-visual">
            <img src={heroImg} alt="Bike, car and scooter available for rent" />
          </div>
        </div>
      </section>

      {/* ================= STORY / MISSION / VALUES ================= */}
      <section className="container about-story">
        <div className="about-card story-card">
          <div className="story-image">
            <img src={storyImage} alt="Freedom on Wheels - rider on a scenic coastal road" />
          </div>
          <div className="story-text">
            <span className="section-label">Our Story</span>
            <h2>How It All Started</h2>
            <p>
              RideNow was founded with a simple idea make bike and scooter rentals
              accessible, affordable and hassle free for everyone. What started as a
              small initiative quickly grew into a community of riders who love the
              freedom to explore without limits.
            </p>
            <p>
              Today, RideNow serves thousands of happy customers and continues to grow,
              one ride at a time.
            </p>
          </div>
        </div>

        <div className="about-card mission-card">
          <span className="section-label">Our Mission</span>
          <div className="card-heading">
            <span className="about-icon-circle large">
              <Icon name="target" size={24} />
            </span>
            <h2>Our Mission</h2>
          </div>
          <p>
            To make urban and travel mobility simple, safe and accessible for everyone,
            by providing reliable and affordable bike and scooter rentals with
            unmatched customer support.
          </p>
        </div>

        <div className="about-card values-card">
          <span className="section-label">Our Values</span>
          <div className="card-heading">
            <span className="about-icon-circle large">
              <Icon name="heart" size={22} />
            </span>
            <h2>Our Values</h2>
          </div>
          <ul className="values-list">
            {values.map((value) => (
              <li key={value}>
                <CheckIcon />
                {value}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= IMPACT ================= */}
      <section className="container about-impact-wrap">
        <div className="about-card about-impact">
          <div className="impact-intro">
            <span className="section-label">Our Impact</span>
            <h2>Rides That Add Up</h2>
            <p>Numbers that show how many riders trust RideNow.</p>
          </div>

          <div className="about-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-item">
                <span className="about-icon-circle large">
                  <Icon name={stat.icon} size={22} />
                </span>
                <div>
                  <h3>{stat.number}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;