import React from 'react';
import Icon from './Icon.jsx';
import { capitalize, BOOKING_STATUS_TONE, PAYMENT_STATE_TONE } from '../utils/adminHelpers.js';

export function Pill({ tone = 'neutral', mark = 'dot', children }) {
  return (
    <span className={`ad-pill ad-pill--${tone}`}>
      {mark === 'dot' && <span className="ad-pill__dot" />}
      {mark === 'x' && <span className="ad-pill__x">×</span>}
      {children}
    </span>
  );
}

export function BookingStatusPill({ status }) {
  const key = String(status || 'pending').toLowerCase();
  return (
    <Pill tone={BOOKING_STATUS_TONE[key] || 'neutral'} mark={key === 'cancelled' ? 'x' : 'dot'}>
      {capitalize(key)}
    </Pill>
  );
}

export function PaymentStatePill({ state }) {
  const labels = { paid: 'Paid', pending: 'Pending', refunded: 'Refunded', failed: 'Failed' };
  return (
    <Pill tone={PAYMENT_STATE_TONE[state] || 'neutral'} mark={state === 'refunded' ? 'x' : 'dot'}>
      {labels[state] || capitalize(state)}
    </Pill>
  );
}

export function TypeBadge({ type }) {
  const key = String(type || '').toLowerCase();
  if (!key) return <span className="ad-sub">—</span>;
  return <span className={`ad-type ad-type--${key}`}>{capitalize(key)}</span>;
}

const METHOD_ICONS = { upi: 'rupee', card: 'creditCard', razorpay: 'zap', cod: 'wallet', online: 'creditCard' };

export function MethodBadge({ method, label }) {
  return (
    <span className={`ad-method ad-method--${method}`}>
      <Icon name={METHOD_ICONS[method] || 'creditCard'} size={13} />
      {label}
    </span>
  );
}
