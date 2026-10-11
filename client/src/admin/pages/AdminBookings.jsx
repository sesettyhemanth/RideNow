import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api.js';
import { useUrlSearch, usePagedList, useVehicleCatalog } from '../hooks/adminHooks.js';
import Icon from '../components/Icon.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard, { Trend } from '../components/StatCard.jsx';
import DateRangePicker from '../components/DateRangePicker.jsx';
import SelectField from '../components/SelectField.jsx';
import Pagination from '../components/Pagination.jsx';
import RowMenu from '../components/RowMenu.jsx';
import Avatar from '../components/Avatar.jsx';
import VehicleThumb from '../components/VehicleThumb.jsx';
import { BookingStatusPill, PaymentStatePill, TypeBadge } from '../components/Badges.jsx';
import {
  ALL_TIME,
  byNewest,
  bookingCode,
  bookingUserName,
  formatCurrency,
  formatDate,
  formatTime,
  inRange,
  paymentOf,
  rentalDays,
  statusOf,
  weeklyTrend,
} from '../utils/adminHelpers.js';
import '../styles/AdminTheme.css';
import '../styles/AdminTable.css';
import '../styles/AdminBookings.css';

const PAGE_SIZE = 6;
const EMPTY_FILTERS = { q: '', status: '', type: '', payment: '' };

// "Picked up" bookings are still confirmed bookings, so they show under the Confirmed filter and count.
const isPickedUp = (status) => ['picked_up', 'pickedup', 'picked up'].includes(String(status || '').toLowerCase());
const matchesStatus = (b, wanted) => {
  const status = String(statusOf(b) || '').toLowerCase();
  if (wanted === 'confirmed') return status === 'confirmed' || isPickedUp(status);
  return status === wanted;
};

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState(ALL_TIME);
  // "draft" is what the inputs show, "applied" is what actually filters (Apply Filters / Enter)
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);

  const navigate = useNavigate();
  const urlQuery = useUrlSearch();
  const { vehicles } = useVehicleCatalog();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings');
      setBookings([...(res.data.data || [])].sort(byNewest));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // top-bar search -> /admin/bookings?q=...
  useEffect(() => {
    setDraft((d) => ({ ...d, q: urlQuery }));
    setApplied((a) => ({ ...a, q: urlQuery }));
  }, [urlQuery]);

  // bookings store vehicleId (the Vehicle _id as a string); fall back to the name for older records
  const vehicleLookup = useMemo(() => {
    const byId = new Map(vehicles.map((v) => [String(v.id), v]));
    const byName = new Map(vehicles.map((v) => [String(v.name).toLowerCase(), v]));
    return (b) => byId.get(String(b.vehicleId)) || byName.get(String(b.vehicleName).toLowerCase());
  }, [vehicles]);

  const inPeriod = useMemo(() => bookings.filter((b) => inRange(b.createdAt, range)), [bookings, range]);

  const counts = useMemo(
    () => ({
      total: inPeriod.length,
      pending: inPeriod.filter((b) => statusOf(b) === 'pending').length,
      confirmed: inPeriod.filter((b) => matchesStatus(b, 'confirmed')).length,
      cancelled: inPeriod.filter((b) => statusOf(b) === 'cancelled').length,
    }),
    [inPeriod]
  );

  const trends = useMemo(() => {
    const countOf = (status) => (b) => (matchesStatus(b, status) ? 1 : 0);
    return {
      total: weeklyTrend(bookings, (b) => b.createdAt),
      pending: weeklyTrend(bookings, (b) => b.createdAt, countOf('pending')),
      confirmed: weeklyTrend(bookings, (b) => b.createdAt, countOf('confirmed')),
      cancelled: weeklyTrend(bookings, (b) => b.createdAt, countOf('cancelled')),
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = applied.q.trim().toLowerCase();
    return inPeriod.filter((b) => {
      if (applied.status && !matchesStatus(b, applied.status)) return false;
      if (applied.type && String(b.vehicleType).toLowerCase() !== applied.type) return false;
      if (applied.payment && paymentOf(b).bookingState !== applied.payment) return false;
      if (q) {
        const haystack = [bookingCode(b), b._id, b.userEmail, bookingUserName(b), b.vehicleName].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [inPeriod, applied]);

  const pager = usePagedList(filtered, PAGE_SIZE, [applied, range]);

  const applyFilters = (e) => {
    e?.preventDefault();
    setApplied(draft);
  };
  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setRange(ALL_TIME);
    navigate('/admin/bookings', { replace: true }); // also clears ?q= from the top-bar search
  };
  // dropdowns apply instantly; the search box waits for Enter / Apply Filters
  const setField = (key) => (value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (key !== 'q') setApplied((a) => ({ ...a, [key]: value }));
  };

  const changeStatus = async (booking, status, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      const res = await api.put(`/bookings/${booking._id}/status`, { status });
      setBookings((list) => list.map((b) => (b._id === booking._id ? { ...b, ...res.data.data } : b)));
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not update this booking. Please try again.');
    }
  };

  return (
    <div>
      <PageHeader
        icon="calendar"
        title="Bookings"
        subtitle="View and manage all vehicle bookings from users."
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />

      {error && (
        <div className="ad-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="ad-btn ad-btn--sm" onClick={fetchBookings}>
            Retry
          </button>
        </div>
      )}

      <section className="ad-stats">
        <StatCard tone="yellow" icon="calendar" label="Total Bookings" value={counts.total} footer={<Trend pct={trends.total.pct} />} />
        <StatCard tone="blue" icon="clock" label="Pending" value={counts.pending} footer={<Trend pct={trends.pending.pct} />} />
        <StatCard tone="green" icon="check" label="Confirmed" value={counts.confirmed} footer={<Trend pct={trends.confirmed.pct} />} />
        <StatCard tone="red" icon="x" label="Cancelled" value={counts.cancelled} footer={<Trend pct={trends.cancelled.pct} />} />
      </section>

      <div className="ad-table-card">
        <form className="ad-toolbar" onSubmit={applyFilters}>
          <label className="ad-search">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={draft.q}
              onChange={(e) => setField('q')(e.target.value)}
              placeholder="Search by booking ID, user name or vehicle..."
              aria-label="Search bookings"
            />
          </label>
          <SelectField value={draft.status} onChange={setField('status')} label="Filter by status">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </SelectField>
          <SelectField value={draft.type} onChange={setField('type')} label="Filter by vehicle type">
            <option value="">All Vehicle Types</option>
            <option value="bike">Bike</option>
            <option value="scooter">Scooter</option>
            <option value="car">Car</option>
          </SelectField>
          <SelectField value={draft.payment} onChange={setField('payment')} label="Filter by payment">
            <option value="">All Payment Types</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </SelectField>
          <button type="submit" className="ad-btn ad-btn--primary">
            <Icon name="filter" size={16} /> Apply Filters
          </button>
          <button type="button" className="ad-btn" onClick={resetFilters}>
            <Icon name="reset" size={16} /> Reset
          </button>
        </form>

        <div className="ad-table-scroll">
          <table className="ad-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th>Booking ID</th>
                <th>User</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Pickup Date &amp; Time</th>
                <th>Return Date &amp; Time</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="ad-table-skeleton">
                    <td colSpan={11}>
                      <div className="ad-skeleton" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                pager.rows.map((b, i) => {
                  const user = bookingUserName(b);
                  const state = paymentOf(b).bookingState;
                  const status = statusOf(b);
                  const days = rentalDays(b);
                  return (
                    <tr key={b._id}>
                      <td className="col-num">{pager.offset + i + 1}</td>
                      <td className="ad-strong">{bookingCode(b)}</td>
                      <td>
                        <div className="ad-cell">
                          <Avatar name={user} seed={b.userEmail} size={30} />
                          <div>
                            <strong>{user}</strong>
                            <span className="ad-sub">{b.userEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="ad-cell">
                          <VehicleThumb vehicle={vehicleLookup(b)} type={b.vehicleType} width={44} height={34} />
                          <strong>{b.vehicleName}</strong>
                        </div>
                      </td>
                      <td>
                        <TypeBadge type={b.vehicleType} />
                      </td>
                      <td>
                        {formatDate(b.pickupDate)}
                        <span className="ad-sub">{formatTime(b.pickupDate, b.pickupTime)}</span>
                      </td>
                      <td>
                        {formatDate(b.dropoffDate)}
                        <span className="ad-sub">{formatTime(b.dropoffDate, b.dropoffTime)}</span>
                      </td>
                      <td>
                        <span className="ad-strong">{formatCurrency(b.totalAmount)}</span>
                        <span className="ad-sub">
                          ({days} {days === 1 ? 'day' : 'days'})
                        </span>
                      </td>
                      <td>
                        <BookingStatusPill status={status} />
                      </td>
                      <td>
                        <PaymentStatePill state={state} />
                      </td>
                      <td className="col-actions">
                        <div className="ad-actions">
                          <Link to={`/admin/verify/${b._id}`} className="ad-btn ad-btn--sm">
                            <Icon name="eye" size={14} /> View
                          </Link>
                          <RowMenu
                            items={[
                              { label: 'Confirm booking', icon: 'check', hidden: status !== 'pending', onClick: () => changeStatus(b, 'confirmed') },
                              {
                                label: 'Mark as picked up',
                                icon: 'checkCircle',
                                hidden: status !== 'confirmed',
                                onClick: () => changeStatus(b, 'completed'),
                              },
                              {
                                label: 'Cancel booking',
                                icon: 'xCircle',
                                tone: 'danger',
                                hidden: status === 'cancelled' || status === 'completed',
                                onClick: () => changeStatus(b, 'cancelled', `Cancel booking ${bookingCode(b)}?`),
                              },
                              { label: 'Open verification page', icon: 'idCard', onClick: () => window.open(`/admin/verify/${b._id}`, '_blank', 'noopener') },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && <p className="ad-empty">No bookings match these filters.</p>}

        <Pagination pager={pager} noun="bookings" />
      </div>
    </div>
  );
}

export default AdminBookings;