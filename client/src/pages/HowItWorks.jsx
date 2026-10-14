import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HowItWorks.css';
import '../styles/Mobile.css';

import heroImg from '../assets/hero.png';
import step1Img from '../assets/vehicle.png';
import step2Img from '../assets/booking.png';
import step3Img from '../assets/pickup.png';
import step4Img from '../assets/ride.png';

/* ---------- SVG icons ---------- */
const svgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const PinIcon = ({ size = 22 }) => (
  <svg {...svgProps} width={size} height={size}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg {...svgProps}>
    <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z" />
    <path d="M8.5 12l2.5 2.5 4.5-5" />
  </svg>
);

const RupeeIcon = () => (
  <svg {...svgProps}>
    <path d="M7 5h10" />
    <path d="M7 9h10" />
    <path d="M7 5c5 0 8 1.5 8 4s-3 4-8 4l8 6" />
  </svg>
);

const HeadsetIcon = () => (
  <svg {...svgProps}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="3" y="14" width="4" height="6" rx="1.5" />
    <rect x="17" y="14" width="4" height="6" rx="1.5" />
    <path d="M19 20c0 1.5-2 2-5 2" />
  </svg>
);

const LeafIcon = () => (
  <svg {...svgProps}>
    <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" />
    <path d="M5 19c3-5 6-8 10-10" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12h16" />
    <path d="M14 6l6 6-6 6" />
  </svg>
);

/* ---------- Data ---------- */
const steps = [
  {
    number: 1,
    title: 'Choose Your Vehicle',
    desc: 'Browse our wide range of bikes and scooters. Compare models, prices and features.',
    image: step1Img,
  },
  {
    number: 2,
    title: 'Book & Pay',
    desc: 'Select your preferred ride, choose the rental duration and make a secure online payment.',
    image: step2Img,
  },
  {
    number: 3,
    title: 'Pick Up',
    desc: 'Visit the location, show your booking details and collect your vehicle.',
    image: step3Img,
  },
  {
    number: 4,
    title: 'Ride & Enjoy',
    desc: 'Hit the road and explore the city with freedom. Return the vehicle at the end of your trip.',
    image: step4Img,
    cover: true,
  },
];

const perks = [
  { icon: <ShieldIcon />, tone: 'blue', title: 'Well-Maintained Vehicles', desc: 'Safe, clean and regularly serviced.' },
  { icon: <RupeeIcon />, tone: 'green', title: 'Affordable Pricing', desc: 'Best rates with no hidden charges.' },
  { icon: <PinIcon />, tone: 'purple', title: 'Multiple Pickup Locations', desc: 'Convenient spots across the city.' },
  { icon: <HeadsetIcon />, tone: 'orange', title: '24/7 Customer Support', desc: "We're always here to help you." },
  { icon: <LeafIcon />, tone: 'teal', title: 'Eco-Friendly Travel', desc: 'A cleaner city for a greener tomorrow.' },
];

function HowItWorks() {
  return (
    <div className="how-it-works">
      {/* HERO */}
      <section className="hiw-hero">
        <div className="container hiw-hero-inner">
          <div className="hiw-hero-text">
            <span className="section-label hiw-pill">
              <PinIcon size={14} />
              Simple Steps, Big Rides
            </span>
            <h1>
              How It <span className="highlight">Works</span>
            </h1>
            <p>
              Renting a bike or scooter with RideNow is quick, easy
              <br className="hiw-br" />
              and hassle free. Just follow a few simple steps and
              <br className="hiw-br" />
              hit the road!
            </p>
          </div>

          <div className="hiw-hero-visual">
            <img src={heroImg} alt="Yellow scooter ready to ride" />
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="container steps-section">
        <div className="steps-heading">
          <span className="steps-label">Easy Steps</span>
          <h2>Get Your Ride in 4 Simple Steps</h2>
          <p>From booking to riding, we’ve made it super simple for you.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={step.number} className="step-card">
              <div className="step-head">
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.desc}</p>
              <div className={`step-image ${step.cover ? 'step-image-cover' : ''}`}>
                <img src={step.image} alt={step.title} />
              </div>

              {index < steps.length - 1 && (
                <span className="step-arrow">
                  <ArrowIcon />
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PERKS */}
      <section className="perks-section">
        <div className="container">
          <div className="perks-intro">
            <span className="perks-label">Why Choose RideNow?</span>
            <h2>More Than Just a Ride</h2>
          </div>

          <div className="perks-grid">
            {perks.map((perk) => (
              <div key={perk.title} className="perk-card">
                <span className={`perk-icon perk-${perk.tone}`}>{perk.icon}</span>
                <div>
                  <h4>{perk.title}</h4>
                  <p>{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default HowItWorks;