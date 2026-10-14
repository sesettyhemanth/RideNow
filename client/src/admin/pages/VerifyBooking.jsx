import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api.js';
import Icon from '../components/Icon.jsx';
import { BookingStatusPill, Pill } from '../components/Badges.jsx';
import { bookingCode, formatCurrency, formatDate, statusOf } from '../utils/adminHelpers.js';
import '../styles/AdminTheme.css';
import '../styles/VerifyBooking.css';
import '../styles/AdminMobile.css';

const LICENSE_TONE = { verified: 'success', pending: 'warning', rejected: 'danger', not_submitted: 'neutral' };

function VerifyBooking() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      setError('');
      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find this booking');
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      const res = await api.put(`/bookings/${bookingId}/status`, { status });
      setBooking((prev) => ({ ...prev, ...res.data.data, user: prev?.user }));
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not update this booking. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (error) {
    return (
      <section className="admin-theme verify-page">
        <div className="verify-card ad-card">
          <span className="verify-icon verify-icon--error">
            <Icon name="xCircle" size={30} />
          </span>
          <h1>Booking not found</h1>
          <p className="verify-error">{error}</p>
          <Link to="/admin/bookings" className="ad-btn">
            <Icon name="chevronLeft" size={16} /> Back to bookings
          </Link>
        </div>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="admin-theme verify-page">
        <p className="verify-loading">Loading booking...</p>
      </section>
    );
  }

  const status = statusOf(booking);
  const license = booking.user?.licenseStatus || 'unknown';

  const rows = [
    ['Renter', booking.user?.name || booking.userEmail],
    ['Email', booking.userEmail],
    ['License Status', <Pill key="license" tone={LICENSE_TONE[license] || 'neutral'}>{license.replace('_', ' ')}</Pill>],
    ['Vehicle', `${booking.vehicleName} (${booking.vehicleType})`],
    ['Pickup Location', booking.pickupLocation],
    ['Pickup Date', formatDate(booking.pickupDate)],
    ['Drop-off Date', formatDate(booking.dropoffDate)],
  ];

  return (
    <section className="admin-theme verify-page">
      <div className="verify-card ad-card">
        <Link to="/admin/bookings" className="verify-back">
          <Icon name="chevronLeft" size={15} /> Back to bookings
        </Link>

        <span className="verify-icon">
          <Icon name="idCard" size={30} />
        </span>
        <h1>Booking Verification</h1>
        <p className="verify-code">{bookingCode(booking)}</p>
        <div className="verify-status">
          {status === 'picked_up' ? <Pill tone="info">Picked Up</Pill> : <BookingStatusPill status={status} />}
        </div>

        <div className="verify-rows">
          {rows.map(([label, value]) => (
            <div key={label} className="verify-row">
              <span>{label}</span>
              <strong>{value || '—'}</strong>
            </div>
          ))}
          <div className="verify-row verify-total">
            <span>Total Paid</span>
            <strong>{formatCurrency(booking.totalAmount)}</strong>
          </div>
        </div>

        {/* waiting: a booking made while the license was pending - confirm after verifying it */}
        {status === 'pending' && (
          <div className="verify-actions">
            {license !== 'verified' && (
              <p className="verify-error">Verify the renter&apos;s driving license on the Users page to confirm this booking.</p>
            )}
            <button
              type="button"
              className="ad-btn ad-btn--primary"
              disabled={updating || license !== 'verified'}
              onClick={() => updateStatus('confirmed')}
            >
              <Icon name="checkCircle" size={17} /> Confirm Booking
            </button>
            <button type="button" className="ad-btn ad-btn--danger" disabled={updating} onClick={() => updateStatus('cancelled')}>
              Cancel Booking
            </button>
          </div>
        )}

        {/* step 1: renter arrives, admin marks the vehicle as picked up */}
        {status === 'confirmed' && (
          <div className="verify-actions">
            <button type="button" className="ad-btn ad-btn--primary" disabled={updating} onClick={() => updateStatus('picked_up')}>
              <Icon name="checkCircle" size={17} /> Mark Picked Up
            </button>
            <button type="button" className="ad-btn ad-btn--danger" disabled={updating} onClick={() => updateStatus('cancelled')}>
              Cancel Booking
            </button>
          </div>
        )}

        {/* step 2: only after pick-up, the Mark Completed button appears */}
        {status === 'picked_up' && (
          <div className="verify-actions">
            <button type="button" className="ad-btn ad-btn--primary" disabled={updating} onClick={() => updateStatus('completed')}>
              <Icon name="checkCircle" size={17} /> Mark Completed
            </button>
          </div>
        )}

        {/* step 3: after completing, only the Completed button is shown */}
        {status === 'completed' && (
          <div className="verify-actions">
            <button type="button" className="ad-btn verify-done verify-done--completed" disabled>
              <Icon name="checkCircle" size={17} /> Completed
            </button>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="verify-actions">
            <button type="button" className="ad-btn verify-done verify-done--cancelled" disabled>
              <Icon name="xCircle" size={17} /> Cancelled
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default VerifyBooking;