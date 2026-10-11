import React from 'react';
import { avatarTone, initials } from '../utils/adminHelpers.js';

function Avatar({ name, seed, size = 36 }) {
  const [bg, fg] = avatarTone(seed || name);
  return (
    <span
      className="ad-avatar"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.38) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export default Avatar;
