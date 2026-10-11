// Shared by the License page and the booking wizard's Documentation step.

export const LICENSE_NUMBER_PATTERN = /^[A-Z]{2}[- ]?\d{2}[- ]?(19|20)\d{2}[- ]?\d{7}$/i;
export const MIN_AGE = 18;
// Indian mobile: 10 digits starting 6-9, typed after the fixed +91 prefix
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;
export const mobileDigits = (value) => String(value || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').slice(0, 10);
export const formatMobile = (value) => (value ? `+91 ${String(value).replace(/^\+91/, '')}` : '—');
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
export const PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// what a license allows you to ride / drive
export const LICENSE_CLASSES = [
  { key: '2w', label: '2-Wheeler', note: 'Bikes & scooters' },
  { key: '4w', label: '4-Wheeler', note: 'Cars' },
];

export const classLabel = (key) => LICENSE_CLASSES.find((c) => c.key === key)?.label || key;

export const LICENSE_STATUS = {
  not_submitted: { text: 'Not Submitted', color: '#6b7280' },
  pending: { text: 'Pending — waiting for admin verification', color: '#f59e0b' },
  verified: { text: 'Verified', color: '#22c55e' },
  rejected: { text: 'Rejected — please check your details and resubmit', color: '#ef4444' },
};

// bikes and scooters need a 2-wheeler license, cars need a 4-wheeler license
export const classForVehicle = (vehicleType) => (vehicleType === 'car' ? '4w' : '2w');

// older accounts have no classes saved - don't block them
export function licenseCoversVehicle(classes, vehicleType) {
  if (!vehicleType || !classes || classes.length === 0) return true;
  return classes.includes(classForVehicle(vehicleType));
}

export const todayString = () => new Date().toISOString().slice(0, 10);

export function formatLicenseDob(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  // the DOB is stored as a UTC date, so read it back as UTC to avoid shifting a day
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function photoError(file, label) {
  if (!file) return `Upload the ${label} of your license`;
  if (!PHOTO_TYPES.includes(file.type)) return 'Use a PNG, JPG or WEBP photo';
  if (file.size > MAX_PHOTO_BYTES) return 'Photo must be under 5 MB';
  return '';
}

// returns { field: 'message' } - an empty object means the form is valid
export function validateLicense({ fullName, dob, mobile, licenseNumber, classes, front, back }) {
  const errors = {};

  if (!String(fullName || '').trim()) errors.fullName = 'Enter your full name as printed on the license';

  if (!dob) {
    errors.dob = 'Enter your date of birth';
  } else {
    const date = new Date(dob);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE);
    if (Number.isNaN(date.getTime())) errors.dob = 'Enter a valid date of birth';
    else if (date > new Date()) errors.dob = 'Date of birth cannot be in the future';
    else if (date > cutoff) errors.dob = `You must be at least ${MIN_AGE} years old`;
  }

  if (!mobile) errors.mobile = 'Enter your 10-digit mobile number';
  else if (!MOBILE_PATTERN.test(mobile)) errors.mobile = 'Enter a valid 10-digit mobile number starting with 6-9';

  if (!String(licenseNumber || '').trim()) errors.licenseNumber = 'Enter your license number';
  else if (!LICENSE_NUMBER_PATTERN.test(licenseNumber.trim())) {
    errors.licenseNumber = 'Use the format AA00 YYYY0000000, e.g. AP01 2023 0012345';
  }

  if (!classes || classes.length === 0) errors.classes = 'Choose 2-wheeler, 4-wheeler or both';

  const frontError = photoError(front, 'front');
  if (frontError) errors.front = frontError;
  const backError = photoError(back, 'back');
  if (backError) errors.back = backError;

  return errors;
}