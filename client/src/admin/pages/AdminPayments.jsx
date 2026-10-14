import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api.js';
import { useUrlSearch, usePagedList } from '../hooks/adminHooks.js';
import Icon from '../components/Icon.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard, { Trend } from '../components/StatCard.jsx';
import DateRangePicker from '../components/DateRangePicker.jsx';
import SelectField from '../components/SelectField.jsx';
import Pagination from '../components/Pagination.jsx';
import RowMenu from '../components/RowMenu.jsx';
import Avatar from '../components/Avatar.jsx';
import { MethodBadge, Pill } from '../components/Badges.jsx';
import {
  ALL_TIME,
  PAYMENT_METHODS,
  byNewest,
  bookingCode,
  bookingUserName,
  downloadCSV,
  formatCurrency,
  formatDate,
  formatTime,
  inRange,
  parseDate,
  paymentOf,
  transactionId,
  weeklyTrend,
} from '../utils/adminHelpers.js';
import '../styles/AdminTheme.css';
import '../styles/AdminTable.css';
import '../styles/AdminPayments.css';
import '../styles/AdminMobile.css';

const PAGE_SIZE = 6;

const STATUS_PILL = {
  success: { tone: 'success', label: 'Success' },
  pending: { tone: 'warning', label: 'Pending' },
  failed: { tone: 'danger', label: 'Failed' },
  refunded: { tone: 'purple', label: 'Refunded' },
};

const SORTS = {
  newest: { label: 'Sort by: Newest', fn: (a, b) => byNewest(a.b, b.b) },
  oldest: { label: 'Sort by: Oldest', fn: (a, b) => byNewest(b.b, a.b) },
  high: { label: 'Sort by: Amount (high)', fn: (a, b) => (b.b.totalAmount || 0) - (a.b.totalAmount || 0) },
  low: { label: 'Sort by: Amount (low)', fn: (a, b) => (a.b.totalAmount || 0) - (b.b.totalAmount || 0) },
};

function AdminPayments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState(ALL_TIME);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState(() => new Set());
  const urlQuery = useUrlSearch();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  const payments = useMemo(() => bookings.map((b) => ({ b, pay: paymentOf(b) })), [bookings]);

  const stats = useMemo(() => {
    const scoped = payments.filter(({ b }) => inRange(b.createdAt, range));
    const isStatus = (s) => ({ pay }) => pay.status === s;
    const sum = (list) => list.reduce((total, { b }) => total + (b.totalAmount || 0), 0);
    const trendOf = (valueFn) => weeklyTrend(payments, ({ b }) => b.createdAt, valueFn).pct;

    return {
      revenue: sum(scoped.filter(isStatus('success'))),
      completed: scoped.filter(isStatus('success')).length,
      pending: scoped.filter(isStatus('pending')).length,
      failed: scoped.filter(isStatus('failed')).length,
      revenueTrend: trendOf(({ b, pay }) => (pay.status === 'success' ? b.totalAmount || 0 : 0)),
      completedTrend: trendOf(({ pay }) => (pay.status === 'success' ? 1 : 0)),
      pendingTrend: trendOf(({ pay }) => (pay.status === 'pending' ? 1 : 0)),
      failedTrend: trendOf(({ pay }) => (pay.status === 'failed' ? 1 : 0)),
    };
  }, [payments, range]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments
      .filter(({ b, pay }) => {
        if (!inRange(b.createdAt, range)) return false;
        if (method && pay.method !== method) return false;
        if (status && pay.status !== status) return false;
        if (q) {
          const haystack = [bookingCode(b), b._id, transactionId(b), b.userEmail, bookingUserName(b), b.vehicleName].join(' ').toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort(SORTS[sort].fn);
  }, [payments, range, method, status, search, sort]);

  const pager = usePagedList(rows, PAGE_SIZE, [range, method, status, search, sort]);

  const pageIds = pager.rows.map(({ b }) => b._id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAllOnPage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => (allOnPageSelected ? next.delete(id) : next.add(id)));
      return next;
    });

  const exportReport = () => {
    const source = selected.size > 0 ? rows.filter(({ b }) => selected.has(b._id)) : rows;
    downloadCSV(
      `ridenow-payments-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Booking ID', 'User', 'Email', 'Vehicle', 'Amount (INR)', 'Method', 'Transaction ID', 'Date', 'Status'],
      source.map(({ b, pay }) => [
        bookingCode(b),
        bookingUserName(b),
        b.userEmail,
        b.vehicleName,
        b.totalAmount || 0,
        pay.methodLabel,
        transactionId(b),
        parseDate(b.createdAt)?.toISOString() || '',
        STATUS_PILL[pay.status].label,
      ])
    );
  };

  const copyTransaction = async (b) => {
    try {
      await navigator.clipboard.writeText(transactionId(b));
    } catch {
      window.prompt('Copy the transaction ID:', transactionId(b));
    }
  };

  return (
    <div>
      <PageHeader
        icon="creditCard"
        title="Payments"
        subtitle="View and manage all payment transactions."
        actions={
          <>
            <DateRangePicker value={range} onChange={setRange} />
            <button type="button" className="ad-btn ad-btn--primary" onClick={exportReport}>
              <Icon name="download" size={16} /> {selected.size > 0 ? `Export (${selected.size})` : 'Export Report'}
            </button>
          </>
        }
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
        <StatCard tone="yellow" icon="wallet" label="Total Revenue" value={formatCurrency(stats.revenue)} footer={<Trend pct={stats.revenueTrend} />} />
        <StatCard tone="blue" icon="creditCard" label="Completed Payments" value={stats.completed} footer={<Trend pct={stats.completedTrend} />} />
        <StatCard tone="green" icon="clock" label="Pending Payments" value={stats.pending} footer={<Trend pct={stats.pendingTrend} />} />
        <StatCard tone="red" icon="x" label="Failed Payments" value={stats.failed} footer={<Trend pct={stats.failedTrend} />} />
      </section>

      <div className="ad-table-card">
        <div className="ad-toolbar">
          <label className="ad-search">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by booking ID, user name, or transaction ID..."
              aria-label="Search payments"
            />
          </label>
          <SelectField value={method} onChange={setMethod} label="Filter by payment method">
            <option value="">All Payment Methods</option>
            {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
            <option value="online">Online</option>
          </SelectField>
          <SelectField value={status} onChange={setStatus} label="Filter by status">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_PILL).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </SelectField>
          <SelectField value={sort} onChange={setSort} icon="sort" label="Sort payments">
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="ad-table-scroll">
          <table className="ad-table">
            <thead>
              <tr>
                <th className="col-check">
                  <input type="checkbox" checked={allOnPageSelected} onChange={toggleAllOnPage} aria-label="Select all on this page" />
                </th>
                <th className="col-num">#</th>
                <th>Booking ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Transaction ID</th>
                <th>Payment Date &amp; Time</th>
                <th>Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="ad-table-skeleton">
                    <td colSpan={10}>
                      <div className="ad-skeleton" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                pager.rows.map(({ b, pay }, i) => {
                  const user = bookingUserName(b);
                  const pill = STATUS_PILL[pay.status];
                  return (
                    <tr key={b._id} className={selected.has(b._id) ? 'is-selected' : ''}>
                      <td className="col-check">
                        <input type="checkbox" checked={selected.has(b._id)} onChange={() => toggleOne(b._id)} aria-label={`Select ${bookingCode(b)}`} />
                      </td>
                      <td className="col-num">{pager.offset + i + 1}</td>
                      <td className="ad-strong">{bookingCode(b)}</td>
                      <td>
                        <div className="ad-cell">
                          <Avatar name={user} seed={b.userEmail} size={34} />
                          <div>
                            <strong>{user}</strong>
                            <span className="ad-sub">{b.userEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="ad-strong">{formatCurrency(b.totalAmount)}</td>
                      <td>
                        <MethodBadge method={pay.method} label={pay.methodLabel} />
                      </td>
                      <td className="ad-mono">{transactionId(b)}</td>
                      <td>
                        {formatDate(b.createdAt)}
                        <span className="ad-sub">{formatTime(b.createdAt)}</span>
                      </td>
                      <td>
                        <Pill tone={pill.tone}>{pill.label}</Pill>
                      </td>
                      <td className="col-actions">
                        <div className="ad-actions">
                          <Link to={`/admin/verify/${b._id}`} className="ad-btn ad-btn--sm">
                            <Icon name="eye" size={14} /> View
                          </Link>
                          <RowMenu
                            items={[
                              { label: 'Copy transaction ID', icon: 'copy', onClick: () => copyTransaction(b) },
                              { label: 'Open booking', icon: 'idCard', onClick: () => window.open(`/admin/verify/${b._id}`, '_blank', 'noopener') },
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

        {!loading && rows.length === 0 && <p className="ad-empty">No transactions match these filters.</p>}

        <Pagination pager={pager} noun="payments" />
      </div>
    </div>
  );
}

export default AdminPayments;
