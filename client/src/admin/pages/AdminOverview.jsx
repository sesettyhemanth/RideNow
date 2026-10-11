import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api.js';
import { fetchVehicleCatalog } from '../hooks/adminHooks.js';
import Icon from '../components/Icon.jsx';
import StatCard, { NewThisWeek, Trend } from '../components/StatCard.jsx';
import LineChart from '../components/LineChart.jsx';
import DonutChart from '../components/DonutChart.jsx';
import SelectField from '../components/SelectField.jsx';
import VehicleThumb from '../components/VehicleThumb.jsx';
import { BookingStatusPill, TypeBadge } from '../components/Badges.jsx';
import {
  byNewest,
  bookingUserName,
  dailySeries,
  formatCurrency,
  formatDate,
  statusOf,
  weeklyTrend,
} from '../utils/adminHelpers.js';
import '../styles/AdminTheme.css';
import '../styles/AdminTable.css';
import '../styles/AdminOverview.css';

const RANGES = [
  { value: 7, label: 'Last 7 Days' },
  { value: 14, label: 'Last 14 Days' },
  { value: 30, label: 'Last 30 Days' },
];

const TYPE_COLORS = { bike: '#fbb826', scooter: '#3b82f6', car: '#14b866' };
const AVAIL_LABEL = { available: 'Available', booked: 'Rented', maintenance: 'Maintenance' };
const TYPE_LABELS = { bike: 'Bikes', scooter: 'Scooters', car: 'Cars' };

function AdminOverview() {
  const [data, setData] = useState({ vehicles: [], users: [], bookings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [vehicles, usersRes, bookingsRes] = await Promise.all([
        fetchVehicleCatalog(),
        api.get('/users'),
        api.get('/bookings'),
      ]);
      setData({
        vehicles,
        users: usersRes.data.data || [],
        bookings: [...(bookingsRes.data.data || [])].sort(byNewest),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { vehicles, users, bookings } = data;

  const stats = useMemo(() => {
    const counted = (b) => statusOf(b) !== 'cancelled';
    return {
      revenue: bookings.filter(counted).reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      vehiclesNew: weeklyTrend(vehicles, (v) => v.createdAt).cur,
      bookingsTrend: weeklyTrend(bookings, (b) => b.createdAt),
      usersTrend: weeklyTrend(users, (u) => u.createdAt),
      revenueTrend: weeklyTrend(
        bookings,
        (b) => b.createdAt,
        (b) => (counted(b) ? b.totalAmount || 0 : 0)
      ),
    };
  }, [vehicles, users, bookings]);

  const series = useMemo(() => dailySeries(bookings, (b) => b.createdAt, days), [bookings, days]);

  const distribution = useMemo(
    () =>
      ['bike', 'scooter', 'car'].map((type) => ({
        label: TYPE_LABELS[type],
        value: vehicles.filter((v) => v.type === type).length,
        color: TYPE_COLORS[type],
      })),
    [vehicles]
  );

  const vehicleByName = useMemo(() => new Map(vehicles.map((v) => [String(v.name).toLowerCase(), v])), [vehicles]);
  const today = formatDate(new Date());

  return (
    <div className="ov">
      <div className="ad-page-header">
        <div>
          <h1>
            Welcome Back, Admin! <span className="ov-wave">👋</span>
          </h1>
          <p>Here&apos;s what&apos;s happening with your rental system today.</p>
        </div>
        <div className="ad-page-header__actions">
          <div className="ov-datechip">
            <Icon name="calendar" size={16} />
            {today}
            <Icon name="chevronDown" size={16} />
          </div>
        </div>
      </div>

      {error && (
        <div className="ad-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="ad-btn ad-btn--sm" onClick={load}>
            Retry
          </button>
        </div>
      )}

      <section className="ad-stats">
        <StatCard
          tone="yellow"
          icon="car"
          label="Total Vehicles"
          value={loading ? '–' : vehicles.length}
          to="/admin/vehicles"
          footer={!loading && <NewThisWeek count={stats.vehiclesNew} />}
        />
        <StatCard
          tone="blue"
          icon="calendar"
          label="Total Bookings"
          value={loading ? '–' : bookings.length}
          to="/admin/bookings"
          footer={!loading && <Trend pct={stats.bookingsTrend.pct} />}
        />
        <StatCard
          tone="green"
          icon="user"
          label="Total Users"
          value={loading ? '–' : users.length}
          to="/admin/users"
          footer={!loading && <Trend pct={stats.usersTrend.pct} />}
        />
        <StatCard
          tone="red"
          icon="rupee"
          label="Total Revenue"
          value={loading ? '–' : formatCurrency(stats.revenue)}
          to="/admin/payments"
          footer={!loading && <Trend pct={stats.revenueTrend.pct} />}
        />
      </section>

      <section className="ov-grid">
        <div className="ad-card">
          <div className="ad-card__head">
            <h3>Booking Overview</h3>
            <SelectField value={days} onChange={(v) => setDays(Number(v))} label="Chart range" className="ov-range">
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </SelectField>
          </div>
          <LineChart data={series} />
        </div>

        <div className="ad-card">
          <div className="ad-card__head">
            <h3>Vehicle Type Distribution</h3>
          </div>
          <div className="ov-distribution">
            <DonutChart segments={distribution} centerValue={vehicles.length} centerLabel="Total Vehicles" />
            <ul className="ov-legend">
              {distribution.map((s) => (
                <li key={s.label}>
                  <span className="ov-legend__dot" style={{ background: s.color }} />
                  <span className="ov-legend__name">{s.label}</span>
                  <span className="ov-legend__count">{s.value}</span>
                  <span className="ov-legend__pct">
                    ({vehicles.length ? Math.round((s.value / vehicles.length) * 100) : 0}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head">
            <h3>Recent Bookings</h3>
            <Link to="/admin/bookings" className="ad-link">
              View All
            </Link>
          </div>
          <div className="ad-table-scroll">
            <table className="ad-table">
              <thead>
                <tr>
                  <th className="col-num">#</th>
                  <th>User</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Pickup Date</th>
                  <th>Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b, i) => (
                  <tr key={b._id}>
                    <td className="col-num">{i + 1}</td>
                    <td className="ad-strong">{bookingUserName(b)}</td>
                    <td>{b.vehicleName}</td>
                    <td>
                      <TypeBadge type={b.vehicleType} />
                    </td>
                    <td>{formatDate(b.pickupDate)}</td>
                    <td>
                      <BookingStatusPill status={b.status} />
                    </td>
                    <td className="col-actions">
                      <Link to={`/admin/verify/${b._id}`} className="ad-btn ad-btn--sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && bookings.length === 0 && <p className="ad-empty">No bookings yet.</p>}
        </div>

        <div className="ad-card">
          <div className="ad-card__head">
            <h3>Manage Vehicles</h3>
            <Link to="/admin/vehicles" className="ad-link">
              View All
            </Link>
          </div>
          <ul className="ov-vehicles">
            {vehicles.slice(0, 4).map((v) => {
              const status = String(v.status || 'available').toLowerCase();
              return (
                <li key={`${v.type}-${v.id}`}>
                  <VehicleThumb vehicle={vehicleByName.get(String(v.name).toLowerCase())} type={v.type} width={58} height={44} />
                  <div className="ov-vehicles__name">
                    <strong>{v.name}</strong>
                    <span className={`ov-avail ov-avail--${status}`}>
                      <i /> {AVAIL_LABEL[status] || status}
                    </span>
                  </div>
                  <TypeBadge type={v.type} />
                  <span className="ov-vehicles__price">
                    {formatCurrency(v.pricePerDay)}
                    <small>/day</small>
                  </span>
                  <Link to={`/admin/vehicles?edit=${v.id}`} className="ad-btn ad-btn--sm ad-btn--edit">
                    Edit
                  </Link>
                </li>
              );
            })}
          </ul>
          {!loading && vehicles.length === 0 && <p className="ad-empty">No vehicles listed yet.</p>}
        </div>
      </section>
    </div>
  );
}

export default AdminOverview;
