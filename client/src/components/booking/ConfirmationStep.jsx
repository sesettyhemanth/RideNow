import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { formatDisplayDate } from '../../utils/bookingValidation.js';
import '../../styles/BookingConfirmation.css';
import '../styles/Mobile.css';

function ConfirmationStep({ booking }) {
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  // booked while the license is still waiting for admin verification
  const isPending = booking.status === 'pending';

  useEffect(() => {
    let ignore = false;

    const verifyLink = `${window.location.origin}/admin/verify/${booking._id}`;

    QRCode.toDataURL(verifyLink, { width: 220, margin: 1 })
      .then((url) => {
        if (!ignore) setQrCodeUrl(url);
      })
      .catch(() => {
        if (!ignore) setQrCodeUrl('');
      });

    return () => {
      ignore = true;
    };
  }, [booking._id]);

  return (
    <div className="confirmation-page">
      <div className="card confirmation-card">
        <span className="confirmation-check">{isPending ? '⏳' : '✅'}</span>
        <h2>{isPending ? 'Booking Pending' : 'Booking Confirmed!'}</h2>
        <p className="confirmation-subtitle">
          {isPending
            ? 'Your vehicle is reserved. The booking is confirmed once our team verifies your driving license.'
            : 'Show this QR code at pickup — our team will scan it to verify your booking.'}
        </p>

        <div className="qr-box">
          {qrCodeUrl ? <img src={qrCodeUrl} alt="Booking verification QR code" /> : <p>Generating your QR code...</p>}
        </div>

        <div className="confirmation-details">
          <div className="confirmation-row">
            <span>Vehicle</span>
            <strong>{booking.vehicleName}</strong>
          </div>
          <div className="confirmation-row">
            <span>Pickup Location</span>
            <strong>{booking.pickupLocation}</strong>
          </div>
          <div className="confirmation-row">
            <span>Pickup Date</span>
            <strong>{formatDisplayDate(booking.pickupDate)}</strong>
          </div>
          <div className="confirmation-row">
            <span>Drop-off Date</span>
            <strong>{formatDisplayDate(booking.dropoffDate)}</strong>
          </div>
          <div className="confirmation-row confirmation-total">
            <span>Total Amount</span>
            <strong>₹{booking.totalAmount}</strong>
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
    </div>
  );
}

export default ConfirmationStep;