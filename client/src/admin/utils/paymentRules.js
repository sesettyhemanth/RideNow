// SAVE THIS AS: client/src/admin/utils/paymentRules.js  (replace the file I gave you before)
//
// One place that decides how a booking's payment shows up in the admin panel.
//   - Online payments (UPI, Card, Net Banking): Success, and "Refunded" once the booking is cancelled
//   - Cash on Delivery: always "Pending" (the cash is collected at pickup)

export const PAYMENT_METHODS = {
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net Banking',
  cod: 'Cash on Delivery',
};

// bookings saved with the old methods are shown under the new ones:
//   razorpay -> Net Banking, wallet -> Cash on Delivery
const LEGACY_METHODS = { razorpay: 'netbanking', wallet: 'cod' };

export function normalizeMethod(raw) {
  const key = String(raw || '').toLowerCase().trim();
  return LEGACY_METHODS[key] || key;
}

const BOOKING_STATE = {
  success: 'paid',
  pending: 'pending',
  failed: 'failed',
  refunded: 'refunded',
};

// Returns { method, methodLabel, status, bookingState }
//   status       -> used by the Payments page (success | pending | failed | refunded)
//   bookingState -> used by the Bookings page (paid | pending | failed | refunded)
export function paymentOf(booking) {
  const method = normalizeMethod(booking?.paymentMethod) || 'online';
  const methodLabel =
    PAYMENT_METHODS[method] || (method === 'online' ? 'Online' : method.charAt(0).toUpperCase() + method.slice(1));

  const cancelled = String(booking?.status || '').toLowerCase() === 'cancelled';
  const saved = String(booking?.paymentStatus || 'success').toLowerCase();

  let status;
  if (method === 'cod') {
    status = 'pending'; // cash on delivery is never shown as paid or refunded
  } else if (cancelled && saved !== 'failed') {
    status = 'refunded'; // online payment taken, booking cancelled -> money goes back
  } else {
    status = ['success', 'pending', 'failed'].includes(saved) ? saved : 'success';
  }

  return { method, methodLabel, status, bookingState: BOOKING_STATE[status] };
}