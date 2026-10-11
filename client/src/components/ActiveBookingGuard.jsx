import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import { useApp } from '../context/AppContext.jsx';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'picked_up'];

function ActiveBookingGuard({ children }) {
  const { user } = useApp();
  const [state, setState] = useState({ loading: Boolean(user), active: null });

  useEffect(() => {
    if (!user) return undefined;
    let ignore = false;

    api
      .get('/bookings/mine')
      .then((res) => {
        if (ignore) return;
        const active = (res.data.data || []).find((b) => ACTIVE_STATUSES.includes(b.status));
        setState({ loading: false, active: active || null });
      })
      // if the check fails, let the page load - the server still blocks a second booking
      .catch(() => !ignore && setState({ loading: false, active: null }));

    return () => {
      ignore = true;
    };
  }, [user]);

  // logged-out visitors are handled by the booking page itself
  if (!user) return children;
  if (state.loading) return <section className="container"><p>Checking your bookings...</p></section>;

  if (state.active) {
    const b = state.active;
    return (
      <section className="container" style={{ padding: '48px 0', textAlign: 'center' }}>
        <h2>You already have an active booking</h2>
        <p style={{ margin: '12px auto 20px', maxWidth: 480, lineHeight: 1.6 }}>
          <strong>{b.vehicleName}</strong> ({b.pickupDate} → {b.dropoffDate}) is still{' '}
          {b.status === 'pending' ? 'waiting for verification' : b.status.replace('_', ' ')}. You can book
          another vehicle once this booking is completed.
        </p>
        <Link to="/profile" className="btn btn-primary">
          View My Bookings
        </Link>
      </section>
    );
  }

  return children;
}

export default ActiveBookingGuard;