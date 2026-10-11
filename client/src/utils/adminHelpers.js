
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;


export const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' && DATE_ONLY.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, withYear = true) {
  const date = parseDate(value);
  if (!date) return value ? String(value) : '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

export function formatTime(value, hint) {
  if (hint) return hint;
  if (typeof value === 'string' && DATE_ONLY.test(value)) return '';
  const date = parseDate(value);
  return date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
}

export function rentalDays(booking) {
  if (booking.days) return Number(booking.days);
  const from = parseDate(booking.pickupDate);
  const to = parseDate(booking.dropoffDate);
  if (!from || !to) return 1;
  return Math.max(1, Math.round((to - from) / DAY_MS));
}

export const capitalize = (s = '') => String(s).charAt(0).toUpperCase() + String(s).slice(1);


export function nameFromEmail(email = '') {
  const local = String(email)
    .split('@')[0]
    .replace(/[0-9]+/g, ' ')
    .replace(/[._-]+/g, ' ')
    .trim();
  if (!local) return 'Guest';
  return local.replace(/\b\w/g, (c) => c.toUpperCase());
}

export const bookingUserName = (b) => b.user?.name || b.userName || nameFromEmail(b.userEmail);

export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const AVATAR_TONES = [
  ['#dbeafe', '#1d4ed8'],
  ['#fde7c8', '#b45309'],
  ['#dcfce7', '#15803d'],
  ['#fce7f3', '#be185d'],
  ['#ede9fe', '#6d28d9'],
  ['#cffafe', '#0e7490'],
];

export function avatarTone(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}


export const bookingCode = (b) => b.bookingCode || `BK${String(b._id || '').slice(-5).toUpperCase()}`;
export const transactionId = (b) => b.transactionId || `txn_${String(b._id || '').slice(-8)}`;
export const statusOf = (b) => String(b.status || 'pending').toLowerCase();

export const BOOKING_STATUS_TONE = {
  confirmed: 'success',
  completed: 'info',
  pending: 'warning',
  cancelled: 'danger',
};

export const PAYMENT_STATE_TONE = {
  paid: 'success',
  pending: 'warning',
  refunded: 'purple',
  failed: 'danger',
};

export const PAYMENT_METHODS = {
  upi: 'UPI',
  card: 'Card',
  razorpay: 'Razorpay',
  cod: 'Cash on Delivery',
};

export function paymentOf(b) {
  const raw = String(b.paymentMethod || '').toLowerCase().replace(/\s+/g, '');
  const method = raw === 'cashondelivery' || raw === 'cash' ? 'cod' : raw || 'online';
  const methodLabel = PAYMENT_METHODS[method] || (method === 'online' ? 'Online' : capitalize(method));

  const explicit = String(b.paymentStatus || '').toLowerCase();
  let status = null;
  if (['success', 'paid', 'completed'].includes(explicit)) status = 'success';
  else if (['pending', 'failed', 'refunded'].includes(explicit)) status = explicit;

  if (!status) {
    const s = statusOf(b);
    status = s === 'cancelled' ? 'refunded' : s === 'pending' ? 'pending' : 'success';
  }

  return {
    method,
    methodLabel,
    status, // success | pending | failed | refunded
    bookingState: status === 'success' ? 'paid' : status, // paid | pending | failed | refunded
  };
}


export const ALL_TIME = { from: null, to: null };

export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
export const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export function presetRange(key) {
  const now = new Date();
  switch (key) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case '7d':
      return { from: startOfDay(new Date(now.getTime() - 6 * DAY_MS)), to: endOfDay(now) };
    case '30d':
      return { from: startOfDay(new Date(now.getTime() - 29 * DAY_MS)), to: endOfDay(now) };
    case 'month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
    default:
      return ALL_TIME;
  }
}

export function inRange(value, range) {
  if (!range.from && !range.to) return true;
  const date = parseDate(value);
  if (!date) return false;
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
}

export function weeklyTrend(items, getDate, getValue = () => 1, now = Date.now()) {
  let cur = 0;
  let prev = 0;
  items.forEach((item) => {
    const date = parseDate(getDate(item));
    if (!date) return;
    const age = now - date.getTime();
    const value = getValue(item);
    if (age >= 0 && age < 7 * DAY_MS) cur += value;
    else if (age >= 7 * DAY_MS && age < 14 * DAY_MS) prev += value;
  });
  const pct = prev === 0 ? (cur > 0 ? null : 0) : Math.round(((cur - prev) / prev) * 100);
  return { cur, prev, pct };
}

// One point per day for the last `days` days (oldest first).
export function dailySeries(items, getDate, days) {
  const today = startOfDay(new Date());
  const buckets = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today.getTime() - i * DAY_MS);
    buckets.push({
      date,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: 0,
    });
  }
  items.forEach((item) => {
    const date = parseDate(getDate(item));
    if (!date) return;
    const diff = Math.round((today - startOfDay(date)) / DAY_MS);
    if (diff >= 0 && diff < days) buckets[days - 1 - diff].value += 1;
  });
  return buckets;
}


export function downloadCSV(filename, headers, rows) {
  const escape = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const byNewest = (a, b) => (parseDate(b.createdAt)?.getTime() || 0) - (parseDate(a.createdAt)?.getTime() || 0);
