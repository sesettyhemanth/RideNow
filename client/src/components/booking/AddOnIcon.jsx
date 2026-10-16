import React from 'react';

// real line-art SVG icons for the add-ons (matched by add-on key)
const ICONS = {
  helmet: (
    <>
      <path d="M3 15v-2.5a9 9 0 0 1 18 0V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 14.5h10.5a2.5 2.5 0 0 0 2.5-2.5V7.8" />
      <path d="M8 18v2.5M16 18v2.5" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="17" rx="2.2" />
      <path d="M10.5 5h3" />
      <path d="M12 19v2.5M8.5 21.5h7" />
    </>
  ),
  truck: (
    <>
      <path d="M14 17V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1.5" />
      <path d="M14 8h4l3.4 4.3a1 1 0 0 1 .2.6V16a1 1 0 0 1-1 1h-1" />
      <path d="M9.5 17h5" />
      <circle cx="7" cy="17.5" r="2.3" />
      <circle cx="17.5" cy="17.5" r="2.3" />
    </>
  ),
  plus: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
};

function pick(name = '') {
  const k = String(name).toLowerCase();
  if (k.includes('helmet')) return 'helmet';
  if (k.includes('holder') || k.includes('mobile') || k.includes('phone')) return 'phone';
  if (k.includes('deliver')) return 'truck';
  return 'plus';
}

function AddOnIcon({ name, size = 22 }) {
  return (
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
      focusable="false"
    >
      {ICONS[pick(name)]}
    </svg>
  );
}

export default AddOnIcon;