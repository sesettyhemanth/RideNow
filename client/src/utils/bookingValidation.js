
export const MAX_RENTAL_DAYS = 30;

export const PICKUP_LOCATIONS = [
  'Visakhapatnam, Andhra Pradesh',
  'Bengaluru, Karnataka',
  'Chennai, Tamil Nadu',
  'Hyderabad, Telangana',
];


const pad = (n) => String(n).padStart(2, '0');

export const toInputDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseInputDate = (value) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const getTodayString = () => toInputDate(new Date());

export const addDaysToDateString = (value, days) => {
  const date = parseInputDate(value);
  date.setDate(date.getDate() + days);
  return toInputDate(date);
};

export const getRentalDays = (pickupDate, dropoffDate) => {
  if (!pickupDate || !dropoffDate) return 0;
  const diff = Math.round((parseInputDate(dropoffDate) - parseInputDate(pickupDate)) / 86_400_000);
  return diff > 0 ? diff : 0;
};

export const formatDisplayDate = (value) => {
  if (!value) return '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseInputDate(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function validateBooking({ pickupLocation, pickupDate, dropoffDate }) {
  const errors = {};
  const today = getTodayString();

  if (!pickupLocation || !PICKUP_LOCATIONS.includes(pickupLocation)) {
    errors.pickupLocation = 'Choose a pickup location from the list.';
  }

  if (!pickupDate) {
    errors.pickupDate = 'Select a pickup date.';
  } else if (pickupDate < today) {
    errors.pickupDate = 'Pickup date can’t be in the past.';
  }

  if (!dropoffDate) {
    errors.dropoffDate = 'Select a drop-off date.';
  } else if (pickupDate && dropoffDate <= pickupDate) {
    errors.dropoffDate = 'Drop-off must be at least one day after pickup.';
  } else if (pickupDate && getRentalDays(pickupDate, dropoffDate) > MAX_RENTAL_DAYS) {
    errors.dropoffDate = `You can rent for up to ${MAX_RENTAL_DAYS} days at a time.`;
  }

  return errors;
}


export const PAYMENT_METHODS = [
  { key: 'card', label: 'Credit / Debit Card', note: 'Visa, Mastercard, RuPay' },
  { key: 'upi', label: 'UPI', note: 'Pay via Google Pay, PhonePe, Paytm etc.' },
  { key: 'netbanking', label: 'Net Banking', note: 'All major banks supported' },
  { key: 'wallet', label: 'Wallet', note: 'Paytm, Amazon Pay, Mobikwik etc.' },
  { key: 'cod', label: 'Cash on Delivery', note: 'Pay when you receive the vehicle' },
];

export const formatCardNumber = (value) =>
  value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();

export const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

function passesLuhn(digits) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

export function validatePayment({ method, cardNumber, expiry, cvv, cardName }) {
  const errors = {};
  if (method !== 'card') return errors;

  const digits = cardNumber.replace(/\s/g, '');
  if (!digits) {
    errors.cardNumber = 'Enter your card number.';
  } else if (digits.length < 13 || digits.length > 19 || !passesLuhn(digits)) {
    errors.cardNumber = 'That card number doesn’t look right. Check it and try again.';
  }

  const expiryMatch = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
  if (!expiry) {
    errors.expiry = 'Enter the expiry date.';
  } else if (!expiryMatch) {
    errors.expiry = 'Use the MM/YY format.';
  } else {
    const month = Number(expiryMatch[1]);
    const year = 2000 + Number(expiryMatch[2]);
    const now = new Date();
    // a card is valid through the END of its expiry month
    if (new Date(year, month, 1) <= now) {
      errors.expiry = 'This card has expired.';
    } else if (year > now.getFullYear() + 20) {
      errors.expiry = 'Check the expiry year.';
    }
  }

  if (!cvv) {
    errors.cvv = 'Enter the CVV.';
  } else if (!/^\d{3,4}$/.test(cvv)) {
    errors.cvv = 'CVV is 3 or 4 digits.';
  }

  if (!cardName.trim()) {
    errors.cardName = 'Enter the name on the card.';
  } else if (!/^[A-Za-z][A-Za-z .'-]{1,59}$/.test(cardName.trim())) {
    errors.cardName = 'Use letters only for the cardholder name.';
  }

  return errors;
}


export const LICENSE_NUMBER_PATTERN = /^[A-Z]{2}[- ]?\d{2}[- ]?(19|20)\d{2}[- ]?\d{7}$/i;

export const LICENSE_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const LICENSE_IMAGE_MAX_MB = 5;

export function validateLicense({ licenseNumber, file }) {
  const errors = {};

  if (!licenseNumber.trim()) {
    errors.licenseNumber = 'Enter your license number.';
  } else if (!LICENSE_NUMBER_PATTERN.test(licenseNumber.trim())) {
    errors.licenseNumber = 'Use the format AA00 YYYY 0000000, for example AP01 2023 0012345.';
  }

  if (!file) {
    errors.licenseFile = 'Choose a photo of your license.';
  } else if (!LICENSE_IMAGE_TYPES.includes(file.type)) {
    errors.licenseFile = 'Upload a PNG, JPG or WebP image.';
  } else if (file.size > LICENSE_IMAGE_MAX_MB * 1024 * 1024) {
    errors.licenseFile = `The photo must be smaller than ${LICENSE_IMAGE_MAX_MB} MB.`;
  }

  return errors;
}
