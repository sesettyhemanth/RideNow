// Pricing + add-on rules for the booking wizard.
// NOTE: this replaces the old utils/bookingPricing.js - adjust the prices below to match your business.

export const ADD_ON_OPTIONS = [
  { key: 'helmet', label: 'Helmet', price: 100, emoji: '⛑️' },
  { key: 'holder', label: 'Mobile Holder', price: 50, emoji: '📱' },
  { key: 'delivery', label: 'Delivery (Within City)', price: 100, emoji: '🚚' },
];

export const PLATFORM_FEE = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

// number of rental days between two YYYY-MM-DD strings (same day = 1 day)
export function rentalDays(pickupDate, dropoffDate) {
  if (!pickupDate || !dropoffDate) return 0;
  const start = new Date(`${pickupDate}T00:00:00`);
  const end = new Date(`${dropoffDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  return Math.max(1, Math.round((end - start) / DAY_MS));
}

export function calculatePricing(vehicle, details) {
  const pricePerDay = Number(vehicle?.pricePerDay) || 0;
  const days = rentalDays(details?.pickupDate, details?.dropoffDate);
  const base = pricePerDay * days;

  const addOns = ADD_ON_OPTIONS.filter((a) => (details?.addOns || []).includes(a.key)).map((a) => ({
    key: a.key,
    label: a.label,
    amount: a.price,
  }));
  const addOnsTotal = addOns.reduce((sum, a) => sum + a.amount, 0);

  const platformFee = days > 0 ? PLATFORM_FEE : 0;
  const rentalPrice = base + addOnsTotal;
  const totalAmount = rentalPrice + platformFee;

  return { pricePerDay, days, base, addOns, addOnsTotal, platformFee, rentalPrice, totalAmount };
}

export const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;