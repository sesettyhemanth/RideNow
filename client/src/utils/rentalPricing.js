import { calculatePricing, PLATFORM_FEE } from './bookingPricing.js';

// Helmet + platform-fee rules for the booking flow.
// Wraps bookingPricing.js and applies the helmet rules (1 free, extra ₹100 each).
export const HELMET_KEY = 'helmet';
export const FREE_HELMETS = 1; // first helmet is free
export const HELMET_PRICE = 100; // every extra helmet
export const MAX_HELMETS = 2; // change this if you want to allow more

export function calculatePricingWithHelmets(vehicle, details) {
  const otherAddOns = (details.addOns || []).filter((k) => k !== HELMET_KEY);
  const p = calculatePricing(vehicle, { ...details, addOns: otherAddOns });

  const helmets = Math.min(MAX_HELMETS, Math.max(FREE_HELMETS, details.helmets ?? FREE_HELMETS));
  const extra = helmets - FREE_HELMETS;

  const helmetLines = [{ key: HELMET_KEY, label: `Helmet (${FREE_HELMETS} free)`, amount: 0 }];
  if (extra > 0) {
    helmetLines.push({ key: `${HELMET_KEY}-extra`, label: `Extra Helmet × ${extra}`, amount: extra * HELMET_PRICE });
  }

  const addOns = [...helmetLines, ...(p.addOns || [])];
  const addOnsTotal = addOns.reduce((sum, a) => sum + a.amount, 0);
  const rentalPrice = p.base + addOnsTotal;
  const platformFee = p.days > 0 ? PLATFORM_FEE : 0; // fee (now ₹10) lives in bookingPricing.js

  return {
    ...p,
    addOns,
    addOnsTotal,
    platformFee,
    rentalPrice,
    totalAmount: rentalPrice + platformFee,
  };
}