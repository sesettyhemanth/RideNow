import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import LicenseSection from '../LicenseSection.jsx';
import { licenseCoversVehicle } from '../../utils/licenseValidation.js';
import '../../styles/Booking.validation.css';
import '../../styles/BookingWizard.css';

function DocumentationStep({ vehicleType, onBack, onConfirm, confirming, confirmError }) {
  const { user } = useApp();

  const status = user.licenseStatus || 'not_submitted';
  const submitted = status === 'pending' || status === 'verified';
  const covers = licenseCoversVehicle(user.licenseClasses, vehicleType);
  const canConfirm = submitted && covers;

  return (
    <div className="license-page">
      <LicenseSection vehicleType={vehicleType} />

      {status === 'rejected' && (
        <p className="wizard-error" role="alert">
          Your licence was rejected. Please correct the details and submit it again.
        </p>
      )}

      {confirmError && (
        <p className="wizard-error" role="alert">
          {confirmError}
        </p>
      )}

      <div className="wizard-actions">
        <button className="btn btn-outline" onClick={onBack} disabled={confirming}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={onConfirm} disabled={!canConfirm || confirming}>
          {confirming ? 'Confirming...' : status === 'verified' ? 'Confirm Booking' : 'Book Now (Pending verification)'}
        </button>
      </div>
    </div>
  );
}

export default DocumentationStep;