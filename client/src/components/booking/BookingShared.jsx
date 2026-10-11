import React from 'react';
import { vehicleImageUrl, vehicleImageCount } from '../../utils/vehicleImage.js';
import bikeImg from '../../assets/bike.png';
import scooterImg from '../../assets/scooter.png';
import carImg from '../../assets/car.png';
import heroImage from '../../assets/hero.png';

const typeImage = { bike: bikeImg, scooter: scooterImg, car: carImg };

// every hour from 6 AM to 10 PM
export const TIME_OPTIONS = Array.from({ length: 17 }, (_, i) => {
  const h24 = i + 6;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:00 ${h24 < 12 ? 'AM' : 'PM'}`;
});

export const todayString = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function formatShortDate(value) {
  if (!value) return '—';
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function VehicleThumb({ vehicle, className = '' }) {
  const type = (vehicle?.type || '').toLowerCase();
  const src = vehicle && vehicleImageCount(vehicle) > 0 ? vehicleImageUrl(vehicle) : typeImage[type] || heroImage;
  return (
    <div className={`bk-thumb ${className}`}>
      <img src={src} alt={vehicle?.name || 'Vehicle'} />
    </div>
  );
}

export function TypeTag({ type }) {
  return <span className="bk-tag">{type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Vehicle'}</span>;
}

/* small line icons used by the booking steps */
const PATHS = {
  pin: 'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  calendar: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 2v4M8 2v4M3 10h18',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  card: 'M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 10h20M6 15h4',
  bank: 'M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-7 10 7z',
  wallet: 'M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2zM16 14h2',
  upi: 'M4 4l8 8-8 8M12 4l8 8-8 8',
  doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  addon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1M4.6 9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1',
};

export function Ico({ name, size = 16 }) {
  return (
    <svg
      className="bk-ico"
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
      <path d={PATHS[name]} />
    </svg>
  );
}