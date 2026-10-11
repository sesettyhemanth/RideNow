import React, { useCallback, useEffect, useState } from 'react';
import api from '../../api.js';
import Icon from '../components/Icon.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { formatCurrency, formatDate, formatTime, statusOf } from '../utils/adminHelpers.js';
import '../styles/AdminTheme.css';
import '../styles/AdminNotifications.css';

function AdminNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, bookingsRes] = await Promise.all([api.get('/users'), api.get('/bookings')]);

      const userEvents = (usersRes.data.data || []).map((u) => ({
        id: `user-${u.id}`,
        kind: 'user',
        text: `${u.name} created an account`,
        detail: u.isGoogleAccount ? 'Signed up with Google' : 'Signed up with email',
        date: u.createdAt,
      }));

      const bookingEvents = (bookingsRes.data.data || []).map((b) => ({
        id: `booking-${b._id}`,
        kind: 'booking',
        text: `${b.userEmail} booked ${b.vehicleName}`,
        detail: `${formatCurrency(b.totalAmount)} • ${statusOf(b)}`,
        date: b.createdAt,
      }));

      const merged = [...userEvents, ...bookingEvents].sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(merged.slice(0, 20));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load recent activity.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  return (
    <div>
      <PageHeader icon="bell" title="Notifications" subtitle="Recent activity across RideNow - new signups and new bookings." />

      {error && (
        <div className="ad-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="ad-btn ad-btn--sm" onClick={loadActivity}>
            Retry
          </button>
        </div>
      )}

      <div className="ad-card notifications-card">
        {loading && <p className="ad-empty">Loading activity...</p>}
        {!loading && !error && items.length === 0 && <p className="ad-empty">Nothing to show yet.</p>}

        {items.map((item) => (
          <div key={item.id} className="notification-row">
            <span className={`notification-icon notification-icon--${item.kind}`}>
              <Icon name={item.kind === 'user' ? 'user' : 'calendar'} size={18} />
            </span>
            <div className="notification-main">
              <p className="notification-text">{item.text}</p>
              <p className="notification-detail">{item.detail}</p>
            </div>
            <span className="notification-time">
              {formatDate(item.date)}
              <small>{formatTime(item.date)}</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminNotifications;
