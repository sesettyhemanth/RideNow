import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api.js';
import { useUrlSearch, usePagedList } from '../hooks/adminHooks.js';
import Icon from '../components/Icon.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard, { Trend } from '../components/StatCard.jsx';
import SelectField from '../components/SelectField.jsx';
import Pagination from '../components/Pagination.jsx';
import RowMenu from '../components/RowMenu.jsx';
import Avatar from '../components/Avatar.jsx';
import { Pill } from '../components/Badges.jsx';
import { byNewest, formatDate, weeklyTrend } from '../utils/adminHelpers.js';
import { classLabel, formatLicenseDob, formatMobile } from '../../utils/licenseValidation.js';
import '../styles/AdminTheme.css';
import '../styles/AdminTable.css';
import '../styles/AdminUsers.css';

const PAGE_SIZE = 8;

const LICENSE = {
  pending: { tone: 'warning', label: 'Pending review' },
  verified: { tone: 'success', label: 'Verified' },
  rejected: { tone: 'danger', label: 'Rejected' },
  not_submitted: { tone: 'neutral', label: 'Not submitted' },
};

function useLicensePhoto(userId, side, available, version) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;
    setUrl('');
    setError('');

    if (!available) {
      setError(`No ${side} photo uploaded.`);
      return undefined;
    }

    api
      .get(`/users/${userId}/license-photo${side === 'back' ? '/back' : ''}`, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setError(`Could not load the ${side} photo.`);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [userId, side, available, version]);

  return { url, error };
}

// Shows everything the user submitted and lets the admin verify or reject it.
function LicenseModal({ user, busy, onDecide, onClose }) {
  const front = useLicensePhoto(user.id, 'front', user.hasLicenseImage, user.licenseSubmittedAt);
  const back = useLicensePhoto(user.id, 'back', user.hasLicenseBackImage, user.licenseSubmittedAt);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const lic = LICENSE[user.licenseStatus] || LICENSE.not_submitted;
  const canDecide = user.licenseStatus !== 'not_submitted' && user.hasLicenseImage;
  const classes = user.licenseClasses?.length ? user.licenseClasses.map(classLabel).join(' + ') : '—';

  const renderPhoto = (photo, label) => (
    <figure className="ad-license-photo">
      <div className="ad-license-photo-frame">
        {photo.url && <img src={photo.url} alt={`${user.name}'s license, ${label}`} />}
        {!photo.url && !photo.error && <p className="ad-sub">Loading photo...</p>}
        {photo.error && <p className="ad-sub">{photo.error}</p>}
      </div>
      <figcaption className="ad-sub">{label}</figcaption>
    </figure>
  );

  return (
    <div className="ad-modal-backdrop" onMouseDown={onClose}>
      <div className="ad-modal" role="dialog" aria-modal="true" aria-label="Review license" onMouseDown={(e) => e.stopPropagation()}>
        <div className="ad-modal-head">
          <div>
            <h2>Driving License</h2>
            <span className="ad-sub">
              Account: {user.name} · {user.email}
            </span>
          </div>
          <button type="button" className="ad-btn ad-btn--sm" onClick={onClose} aria-label="Close">
            <Icon name="x" size={14} />
          </button>
        </div>

        <div className="ad-modal-body">
          <div className="ad-license-meta">
            <div>
              <span className="ad-sub">Full name</span>
              <strong>{user.licenseFullName || '—'}</strong>
            </div>
            <div>
              <span className="ad-sub">Date of birth</span>
              <strong>{formatLicenseDob(user.licenseDob)}</strong>
            </div>
            <div>
              <span className="ad-sub">Mobile number</span>
              <strong className="ad-mono">{formatMobile(user.licenseMobile)}</strong>
            </div>
            <div>
              <span className="ad-sub">License number</span>
              <strong className="ad-mono">{user.licenseNumber || '—'}</strong>
            </div>
            <div>
              <span className="ad-sub">Valid for</span>
              <strong>{classes}</strong>
            </div>
            <div>
              <span className="ad-sub">Status</span>
              <Pill tone={lic.tone}>{lic.label}</Pill>
            </div>
          </div>

          <div className="ad-license-photos">
            {renderPhoto(front, 'Front')}
            {renderPhoto(back, 'Back')}
          </div>
        </div>

        <div className="ad-modal-foot">
          <button
            type="button"
            className="ad-btn ad-btn--danger"
            disabled={busy || !canDecide || user.licenseStatus === 'rejected'}
            onClick={() => onDecide(user, 'rejected')}
          >
            <Icon name="xCircle" size={16} /> Reject
          </button>
          <button
            type="button"
            className="ad-btn ad-btn--primary"
            disabled={busy || !canDecide || user.licenseStatus === 'verified'}
            onClick={() => onDecide(user, 'verified')}
          >
            <Icon name="checkCircle" size={16} /> Verify
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [license, setLicense] = useState('');
  const [method, setMethod] = useState('');
  const [reviewing, setReviewing] = useState(null); // user whose license is open in the modal
  const [deciding, setDeciding] = useState(false);
  const urlQuery = useUrlSearch();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers([...(res.data.data || [])].sort(byNewest));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}'s account? This can't be undone.`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      fetchUsers();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this user.');
    }
  };

  // admin decision: 'verified' or 'rejected'
  const decideLicense = async (user, status) => {
    const verb = status === 'verified' ? 'Verify' : 'Reject';
    if (!window.confirm(`${verb} ${user.name}'s driving license?`)) return;
    try {
      setDeciding(true);
      await api.put(`/licenses/${user.id}`, { status });
      setUsers((list) => list.map((u) => (u.id === user.id ? { ...u, licenseStatus: status } : u)));
      setReviewing((current) => (current && current.id === user.id ? { ...current, licenseStatus: status } : current));
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not update this license.');
    } finally {
      setDeciding(false);
    }
  };

  const counts = useMemo(
    () => ({
      verified: users.filter((u) => u.licenseStatus === 'verified').length,
      rejected: users.filter((u) => u.licenseStatus === 'rejected').length,
      pending: users.filter((u) => u.licenseStatus === 'pending').length,
      trend: weeklyTrend(users, (u) => u.createdAt).pct,
    }),
    [users]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (license && u.licenseStatus !== license) return false;
      if (method === 'google' && !u.isGoogleAccount) return false;
      if (method === 'email' && u.isGoogleAccount) return false;
      if (q && ![u.name, u.email, u.phone].join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, license, method]);

  const pager = usePagedList(filtered, PAGE_SIZE, [search, license, method]);

  return (
    <div>
      <PageHeader icon="users" title="Users" subtitle="Every account registered on RideNow. Review and verify driving licenses here." />

      {error && (
        <div className="ad-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="ad-btn ad-btn--sm" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      )}

      <section className="ad-stats">
        <StatCard tone="yellow" icon="users" label="Total Users" value={users.length} footer={<Trend pct={counts.trend} />} />
        <StatCard tone="blue" icon="clock" label="Pending Review" value={counts.pending} />
        <StatCard tone="green" icon="idCard" label="Verified Licenses" value={counts.verified} />
        <StatCard tone="red" icon="xCircle" label="Rejected Licenses" value={counts.rejected} />
      </section>

      <div className="ad-table-card">
        <div className="ad-toolbar">
          <label className="ad-search">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              aria-label="Search users"
            />
          </label>
          <SelectField value={license} onChange={setLicense} label="Filter by license status">
            <option value="">All License Statuses</option>
            {Object.entries(LICENSE).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </SelectField>
          <SelectField value={method} onChange={setMethod} label="Filter by sign-in method">
            <option value="">All Sign-in Methods</option>
            <option value="google">Google</option>
            <option value="email">Email</option>
          </SelectField>
        </div>

        <div className="ad-table-scroll">
          <table className="ad-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th>User</th>
                <th>Phone</th>
                <th>Sign-in Method</th>
                <th>License</th>
                <th>Joined</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="ad-table-skeleton">
                    <td colSpan={7}>
                      <div className="ad-skeleton" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                pager.rows.map((u, i) => {
                  const lic = LICENSE[u.licenseStatus] || LICENSE.not_submitted;
                  const hasLicense = u.licenseStatus !== 'not_submitted' && u.hasLicenseImage;
                  return (
                    <tr key={u.id}>
                      <td className="col-num">{pager.offset + i + 1}</td>
                      <td>
                        <div className="ad-cell">
                          <Avatar name={u.name} seed={u.email} size={34} />
                          <div>
                            <strong>{u.name}</strong>
                            <span className="ad-sub">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <Pill tone={u.isGoogleAccount ? 'info' : 'neutral'} mark="none">
                          {u.isGoogleAccount ? 'Google' : 'Email'}
                        </Pill>
                      </td>
                      <td>
                        <Pill tone={lic.tone}>{lic.label}</Pill>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td className="col-actions">
                        <div className="ad-actions">
                          {hasLicense && (
                            <button
                              type="button"
                              className={`ad-btn ad-btn--sm${u.licenseStatus === 'pending' ? ' ad-btn--primary' : ''}`}
                              onClick={() => setReviewing(u)}
                            >
                              <Icon name="eye" size={14} /> {u.licenseStatus === 'pending' ? 'Review' : 'View'}
                            </button>
                          )}
                          <RowMenu
                            items={[
                              {
                                label: 'Verify license',
                                icon: 'checkCircle',
                                hidden: !hasLicense || u.licenseStatus === 'verified',
                                onClick: () => decideLicense(u, 'verified'),
                              },
                              {
                                label: 'Reject license',
                                icon: 'xCircle',
                                hidden: !hasLicense || u.licenseStatus === 'rejected',
                                onClick: () => decideLicense(u, 'rejected'),
                              },
                              { label: 'Delete user', icon: 'trash', tone: 'danger', onClick: () => handleDelete(u) },
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

        {!loading && filtered.length === 0 && (
          <p className="ad-empty">{users.length === 0 ? 'No users have signed up yet.' : 'No users match these filters.'}</p>
        )}

        <Pagination pager={pager} noun="users" />
      </div>

      {reviewing && (
        <LicenseModal user={reviewing} busy={deciding} onDecide={decideLicense} onClose={() => setReviewing(null)} />
      )}
    </div>
  );
}

export default AdminUsers;