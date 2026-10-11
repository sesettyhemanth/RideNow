import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api.js';
import Icon from '../components/Icon.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { TypeBadge } from '../components/Badges.jsx';
import { capitalize, downloadCSV, formatCurrency, parseDate, statusOf } from '../utils/adminHelpers.js';
import '../styles/AdminTheme.css';
import '../styles/AdminTable.css';
import '../styles/AdminReports.css';

const MONTHS_BACK = 6;

// Revenue counts every booking that wasn't cancelled.
const earns = (b) => statusOf(b) !== 'cancelled';

function AdminReports() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const report = useMemo(() => {
    const paid = bookings.filter(earns);
    const revenue = paid.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const completed = bookings.filter((b) => statusOf(b) === 'completed').length;
    const cancelled = bookings.filter((b) => statusOf(b) === 'cancelled').length;

    // last N calendar months, oldest first
    const now = new Date();
    const months = Array.from({ length: MONTHS_BACK }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }), revenue: 0, bookings: 0 };
    });
    bookings.forEach((b) => {
      const d = parseDate(b.createdAt);
      if (!d) return;
      const bucket = months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (!bucket) return;
      bucket.bookings += 1;
      if (earns(b)) bucket.revenue += b.totalAmount || 0;
    });

    const byType = ['bike', 'scooter', 'car'].map((type) => {
      const list = bookings.filter((b) => String(b.vehicleType).toLowerCase() === type);
      return {
        type,
        bookings: list.length,
        revenue: list.filter(earns).reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      };
    });

    const vehicleMap = new Map();
    bookings.forEach((b) => {
      const entry = vehicleMap.get(b.vehicleName) || { name: b.vehicleName, type: b.vehicleType, bookings: 0, revenue: 0 };
      entry.bookings += 1;
      if (earns(b)) entry.revenue += b.totalAmount || 0;
      vehicleMap.set(b.vehicleName, entry);
    });
    const topVehicles = [...vehicleMap.values()].sort((a, b) => b.bookings - a.bookings).slice(0, 5);

    return {
      revenue,
      average: paid.length ? Math.round(revenue / paid.length) : 0,
      completionRate: bookings.length ? Math.round((completed / bookings.length) * 100) : 0,
      cancellationRate: bookings.length ? Math.round((cancelled / bookings.length) * 100) : 0,
      months,
      byType,
      topVehicles,
    };
  }, [bookings]);

  const maxMonth = Math.max(1, ...report.months.map((m) => m.revenue));
  const maxType = Math.max(1, ...report.byType.map((t) => t.bookings));

  const exportCsv = () =>
    downloadCSV(
      `ridenow-monthly-report-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Month', 'Bookings', 'Revenue (INR)'],
      report.months.map((m) => [m.label, m.bookings, m.revenue])
    );

  return (
    <div>
      <PageHeader
        icon="barChart"
        title="Reports"
        subtitle="Revenue and booking performance at a glance."
        actions={
          <button type="button" className="ad-btn ad-btn--primary" onClick={exportCsv} disabled={loading}>
            <Icon name="download" size={16} /> Export Monthly CSV
          </button>
        }
      />

      {error && (
        <div className="ad-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="ad-btn ad-btn--sm" onClick={load}>
            Retry
          </button>
        </div>
      )}

      <section className="ad-stats">
        <StatCard tone="yellow" icon="wallet" label="Total Revenue" value={formatCurrency(report.revenue)} />
        <StatCard tone="blue" icon="rupee" label="Avg. Booking Value" value={formatCurrency(report.average)} />
        <StatCard tone="green" icon="checkCircle" label="Completion Rate" value={`${report.completionRate}%`} />
        <StatCard tone="red" icon="xCircle" label="Cancellation Rate" value={`${report.cancellationRate}%`} />
      </section>

      <section className="rp-grid">
        <div className="ad-card">
          <div className="ad-card__head">
            <h3>Revenue - last {MONTHS_BACK} months</h3>
          </div>
          <div className="rp-bars" role="img" aria-label="Monthly revenue">
            {report.months.map((m) => (
              <div key={m.key} className="rp-bars__col">
                <span className="rp-bars__value">{m.revenue ? formatCurrency(m.revenue) : '—'}</span>
                <div className="rp-bars__track">
                  <div className="rp-bars__fill" style={{ height: `${(m.revenue / maxMonth) * 100}%` }} />
                </div>
                <span className="rp-bars__label">{m.label}</span>
                <span className="ad-sub">{m.bookings} bookings</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head">
            <h3>Bookings by vehicle type</h3>
          </div>
          <ul className="rp-types">
            {report.byType.map((t) => (
              <li key={t.type}>
                <div className="rp-types__top">
                  <TypeBadge type={t.type} />
                  <span>
                    <strong>{t.bookings}</strong> bookings • {formatCurrency(t.revenue)}
                  </span>
                </div>
                <div className="rp-types__bar">
                  <span className={`rp-types__fill rp-types__fill--${t.type}`} style={{ width: `${(t.bookings / maxType) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="ad-table-card rp-top">
        <div className="ad-card__head">
          <h3>Top vehicles</h3>
        </div>
        <div className="ad-table-scroll">
          <table className="ad-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Bookings</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {report.topVehicles.map((v, i) => (
                <tr key={v.name}>
                  <td className="col-num">{i + 1}</td>
                  <td className="ad-strong">{v.name}</td>
                  <td>
                    <TypeBadge type={String(v.type).toLowerCase()} />
                  </td>
                  <td>{v.bookings}</td>
                  <td className="ad-strong">{formatCurrency(v.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && report.topVehicles.length === 0 && <p className="ad-empty">{capitalize('no bookings to report on yet.')}</p>}
      </div>
    </div>
  );
}

export default AdminReports;
