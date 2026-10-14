import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import '../styles/BookingConfirmation.css';
import '../styles/Mobile.css';

function BookingConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (!state?.bookingId) return;

    const verifyLink = `${window.location.origin}/admin/verify/${state.bookingId}`;

    QRCode.toDataURL(verifyLink, { width: 220, margin: 1 })
      .then(setQrCodeUrl)
      .catch(() => setQrCodeUrl(''));
  }, [state]);

  if (!state?.bookingId) {
    return (
      <section className="confirmation-page container">
        <p>
          No booking to show. <Link to="/vehicles">Browse vehicles</Link> to make one.
        </p>
      </section>
    );
  }

  const { vehicleName, pickupDate, dropoffDate, pickupLocation, totalAmount } = state;

  return (
    <section className="confirmation-page container">
      <div className="card confirmation-card">
        <span className="confirmation-check">✅</span>
        <h1>Booking Confirmed!</h1>
        <p className="confirmation-subtitle">
          Show this QR code at pickup — our team will scan it to verify your booking.
        </p>

        <div className="qr-box">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="Booking verification QR code" />
          ) : (
            <p>Generating your QR code...</p>
          )}
        </div>

        <div className="confirmation-details">
          <div className="confirmation-row">
            <span>Vehicle</span>
            <strong>{vehicleName}</strong>
          </div>
          <div className="confirmation-row">
            <span>Pickup Location</span>
            <strong>{pickupLocation}</strong>
          </div>
          <div className="confirmation-row">
            <span>Pickup Date</span>
            <strong>{pickupDate}</strong>
          </div>
          <div className="confirmation-row">
            <span>Drop-off Date</span>
            <strong>{dropoffDate}</strong>
          </div>
          <div className="confirmation-row confirmation-total">
            <span>Total Paid</span>
            <strong>₹{totalAmount}</strong>
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="btn btn-outline" onClick={() => navigate('/profile')}>
            View My Bookings
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </section>
  );
}

export default BookingConfirmation;
