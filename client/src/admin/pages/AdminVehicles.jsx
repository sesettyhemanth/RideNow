import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api.js';
import { vehicleImageUrl, vehicleImageCount } from '../../utils/vehicleImage.js';
import { VEHICLE_TYPES, useUrlSearch, usePagedList, useVehicleCatalog } from '../hooks/adminHooks.js';
import Icon from '../components/Icon.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard, { NewThisWeek } from '../components/StatCard.jsx';
import SelectField from '../components/SelectField.jsx';
import Pagination from '../components/Pagination.jsx';
import RowMenu from '../components/RowMenu.jsx';
import Modal from '../components/Modal.jsx';
import VehicleThumb from '../components/VehicleThumb.jsx';
import { Pill, TypeBadge } from '../components/Badges.jsx';
import { capitalize, formatCurrency, parseDate, weeklyTrend } from '../utils/adminHelpers.js';
import '../styles/AdminTheme.css';
import '../styles/AdminTable.css';
import '../styles/AdminVehicles.css';
import '../styles/AdminMobile.css';

const PAGE_SIZE = 6;

const EMPTY_FORM = {
  type: 'bike',
  name: '',
  brand: '',
  numberPlate: '',
  pricePerDay: '',
  status: 'available',
  rating: '4.5',
  trips: '0',
  cc: '',
  mileage: '',
  gears: '',
  seats: '2',
  fuel: 'Petrol',
  transmission: 'Manual',
  location: 'Visakhapatnam, Andhra Pradesh',
  about: '',
};

const DEFAULT_FEATURES = ['Well Maintained', 'Insurance', '24/7 Support'];

// the Vehicle model's status enum is available | booked | maintenance
const STATUS_TONE = { available: 'success', booked: 'warning', maintenance: 'danger' };
const STATUS_LABEL = { available: 'Available', booked: 'Rented', maintenance: 'Maintenance' };

const SORTS = {
  newest: { label: 'Sort by: Newest', fn: (a, b) => (parseDate(b.createdAt)?.getTime() || 0) - (parseDate(a.createdAt)?.getTime() || 0) },
  priceLow: { label: 'Sort by: Price (low)', fn: (a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0) },
  priceHigh: { label: 'Sort by: Price (high)', fn: (a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0) },
  name: { label: 'Sort by: Name (A-Z)', fn: (a, b) => String(a.name).localeCompare(String(b.name)) },
};

const brandOf = (v) => v.brand || String(v.name || '').split(' ')[0] || '—';
const statusOf = (v) => String(v.status || 'available').toLowerCase();

const formFromVehicle = (v) => ({
  type: v.type,
  name: v.name ?? '',
  brand: v.brand ?? '',
  numberPlate: v.numberPlate ?? '',
  pricePerDay: v.pricePerDay ?? '',
  status: statusOf(v),
  rating: v.rating ?? '',
  trips: v.trips ?? '0',
  cc: v.cc ?? '',
  mileage: v.mileage ?? '',
  gears: v.gears ?? '',
  seats: v.seats ?? '',
  fuel: v.fuel ?? 'Petrol',
  transmission: v.transmission ?? 'Manual',
  location: v.location ?? '',
  about: v.about ?? '',
});

function AdminVehicles() {
  const { vehicles, loading, error, reload } = useVehicleCatalog();
  const urlQuery = useUrlSearch();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState(() => new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newPhotos, setNewPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  /* ----------------------------- derived data ----------------------------- */

  const counts = useMemo(() => {
    const of = (t) => vehicles.filter((v) => v.type === t);
    const fresh = (list) => weeklyTrend(list, (v) => v.createdAt).cur;
    return {
      total: vehicles.length,
      bike: of('bike').length,
      scooter: of('scooter').length,
      car: of('car').length,
      newTotal: fresh(vehicles),
      newBike: fresh(of('bike')),
      newScooter: fresh(of('scooter')),
      newCar: fresh(of('car')),
    };
  }, [vehicles]);

  const brands = useMemo(() => [...new Set(vehicles.map(brandOf))].sort((a, b) => a.localeCompare(b)), [vehicles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles
      .filter((v) => {
        if (type && v.type !== type) return false;
        if (brand && brandOf(v) !== brand) return false;
        if (status && statusOf(v) !== status) return false;
        if (q && ![v.name, brandOf(v), v.numberPlate].join(' ').toLowerCase().includes(q)) return false;
        return true;
      })
      .sort(SORTS[sort].fn);
  }, [vehicles, search, type, brand, status, sort]);

  const pager = usePagedList(filtered, PAGE_SIZE, [search, type, brand, status, sort]);

  const pageKeys = pager.rows.map((v) => `${v.type}:${v.id}`);
  const allOnPageSelected = pageKeys.length > 0 && pageKeys.every((k) => selected.has(k));

  const toggleOne = (key) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleAllOnPage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      pageKeys.forEach((k) => (allOnPageSelected ? next.delete(k) : next.add(k)));
      return next;
    });

  /* -------------------------------- actions -------------------------------- */

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, type: type || 'bike' });
    setNewPhotos([]);
    setFormOpen(true);
  };

  const openEdit = (vehicle) => {
    setEditing(vehicle);
    setForm(formFromVehicle(vehicle));
    setNewPhotos([]);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
    setNewPhotos([]);
  };

  // dashboard "Edit" buttons deep-link here with ?edit=<vehicleId>
  useEffect(() => {
    const id = params.get('edit');
    if (!id || vehicles.length === 0) return;
    const vehicle = vehicles.find((v) => String(v.id) === id);
    if (vehicle) openEdit(vehicle);
    const next = new URLSearchParams(params);
    next.delete('edit');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, vehicles]);

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      numberPlate: form.numberPlate.trim().toUpperCase(),
      pricePerDay: Number(form.pricePerDay),
      rating: Number(form.rating),
      trips: Number(form.trips),
      seats: Number(form.seats),
      cc: form.cc,
      mileage: form.mileage,
      gears: form.gears,
      fuel: form.fuel,
      transmission: form.transmission,
      location: form.location,
      about: form.about,
      features: editing?.features?.length ? editing.features : DEFAULT_FEATURES,
    };
    // only send status when the admin actually changed it
    if (!editing || form.status !== statusOf(editing)) payload.status = form.status;
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = buildPayload();

    try {
      let vehicleId = editing?.id;

      if (editing) {
        await api.put(`/vehicles/${editing.type}/${editing.id}`, payload);
      } else {
        const res = await api.post(`/vehicles/${form.type}`, payload);
        vehicleId = res.data.data.id;
      }

      // photos are uploaded separately, once the vehicle has an id to attach them to
      if (newPhotos.length > 0) {
        setUploading(true);
        const formData = new FormData();
        newPhotos.forEach((file) => formData.append('images', file));
        // don't set Content-Type manually - the browser needs to generate its
        // own multipart boundary, and a hardcoded header here strips that out
        await api.put(`/vehicles/${editing ? editing.type : form.type}/${vehicleId}/images`, formData);
      }

      setFormOpen(false);
      setEditing(null);
      setNewPhotos([]);
      reload();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not save vehicle. Your admin session may have expired.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Delete ${vehicle.name}?`)) return;
    try {
      await api.delete(`/vehicles/${vehicle.type}/${vehicle.id}`);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(`${vehicle.type}:${vehicle.id}`);
        return next;
      });
      reload();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this vehicle.');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} selected vehicle(s)? This can't be undone.`)) return;
    const targets = vehicles.filter((v) => selected.has(`${v.type}:${v.id}`));
    const results = await Promise.allSettled(targets.map((v) => api.delete(`/vehicles/${v.type}/${v.id}`)));
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed) window.alert(`${failed} vehicle(s) could not be deleted.`);
    setSelected(new Set());
    reload();
  };

  const quickStatus = async (vehicle, nextStatus) => {
    try {
      await api.put(`/vehicles/${vehicle.type}/${vehicle.id}`, { status: nextStatus });
      reload();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not update the vehicle status.');
    }
  };

  const handleRemovePhoto = async (index) => {
    try {
      await api.delete(`/vehicles/${editing.type}/${editing.id}/images/${index}`);
      setEditing((v) => ({ ...v, imageCount: v.imageCount - 1 }));
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not remove this photo.');
    }
  };

  const photoCount = editing ? vehicleImageCount(editing) : 0;

  /* --------------------------------- render -------------------------------- */

  return (
    <div>
      <PageHeader
        icon="car"
        title="Manage Vehicles"
        subtitle="Add, update or remove vehicles from your rental fleet."
        actions={
          <button type="button" className="ad-btn ad-btn--primary" onClick={openAdd}>
            <Icon name="plus" size={16} /> Add Vehicle
          </button>
        }
      />

      {error && (
        <div className="ad-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="ad-btn ad-btn--sm" onClick={reload}>
            Retry
          </button>
        </div>
      )}

      <section className="ad-stats">
        <StatCard tone="yellow" icon="car" label="Total Vehicles" value={counts.total} footer={<NewThisWeek count={counts.newTotal} />} />
        <StatCard tone="blue" icon="bike" label="Bikes" value={counts.bike} footer={<NewThisWeek count={counts.newBike} />} />
        <StatCard tone="green" icon="scooter" label="Scooters" value={counts.scooter} footer={<NewThisWeek count={counts.newScooter} />} />
        <StatCard tone="purple" icon="car" label="Cars" value={counts.car} footer={<NewThisWeek count={counts.newCar} />} />
      </section>

      <div className="ad-table-card">
        <div className="ad-toolbar">
          <label className="ad-search">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, brand or number plate..."
              aria-label="Search vehicles"
            />
          </label>
          <SelectField value={type} onChange={setType} label="Filter by type">
            <option value="">All Types</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {capitalize(t)}
              </option>
            ))}
          </SelectField>
          <SelectField value={brand} onChange={setBrand} label="Filter by brand">
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </SelectField>
          <SelectField value={status} onChange={setStatus} label="Filter by status">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="booked">Rented</option>
            <option value="maintenance">Maintenance</option>
          </SelectField>
          <SelectField value={sort} onChange={setSort} icon="sort" label="Sort vehicles">
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </SelectField>
        </div>

        {selected.size > 0 && (
          <div className="ad-bulkbar">
            <span>{selected.size} selected</span>
            <div className="ad-actions">
              <button type="button" className="ad-btn ad-btn--sm" onClick={() => setSelected(new Set())}>
                Clear
              </button>
              <button type="button" className="ad-btn ad-btn--sm ad-btn--danger" onClick={handleBulkDelete}>
                <Icon name="trash" size={14} /> Delete selected
              </button>
            </div>
          </div>
        )}

        <div className="ad-table-scroll">
          <table className="ad-table">
            <thead>
              <tr>
                <th className="col-check">
                  <input type="checkbox" checked={allOnPageSelected} onChange={toggleAllOnPage} aria-label="Select all on this page" />
                </th>
                <th>Image</th>
                <th>Vehicle Name</th>
                <th>Type</th>
                <th>Brand</th>
                <th>Number Plate</th>
                <th>Price/Day</th>
                <th>Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="ad-table-skeleton">
                    <td colSpan={9}>
                      <div className="ad-skeleton" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                pager.rows.map((v) => {
                  const key = `${v.type}:${v.id}`;
                  const st = statusOf(v);
                  return (
                    <tr key={key} className={selected.has(key) ? 'is-selected' : ''}>
                      <td className="col-check">
                        <input type="checkbox" checked={selected.has(key)} onChange={() => toggleOne(key)} aria-label={`Select ${v.name}`} />
                      </td>
                      <td>
                        <VehicleThumb vehicle={v} type={v.type} width={76} height={56} />
                      </td>
                      <td>
                        <strong className="ad-strong">{v.name}</strong>
                        {(v.tagline || v.about) && <span className="ad-sub vh-tagline">{v.tagline || v.about}</span>}
                      </td>
                      <td>
                        <TypeBadge type={v.type} />
                      </td>
                      <td>{brandOf(v)}</td>
                      <td>{v.numberPlate || '—'}</td>
                      <td>
                        <span className="ad-strong">{formatCurrency(v.pricePerDay)}</span>
                        <span className="ad-sub vh-inline">/day</span>
                      </td>
                      <td>
                        <Pill tone={STATUS_TONE[st] || 'neutral'}>{STATUS_LABEL[st] || capitalize(st)}</Pill>
                      </td>
                      <td className="col-actions">
                        <div className="ad-actions">
                          <button type="button" className="ad-btn ad-btn--sm ad-btn--edit" onClick={() => openEdit(v)}>
                            <Icon name="pencil" size={13} /> Edit
                          </button>
                          <button type="button" className="ad-btn ad-btn--sm" onClick={() => setViewing({ vehicle: v, photo: 0 })}>
                            <Icon name="eye" size={14} /> View
                          </button>
                          <RowMenu
                            items={[
                              { label: 'Mark as available', icon: 'checkCircle', hidden: st === 'available', onClick: () => quickStatus(v, 'available') },
                              { label: 'Send to maintenance', icon: 'wrench', hidden: st === 'maintenance', onClick: () => quickStatus(v, 'maintenance') },
                              { label: 'Delete vehicle', icon: 'trash', tone: 'danger', onClick: () => handleDelete(v) },
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
          <p className="ad-empty">{vehicles.length === 0 ? 'No vehicles yet - add your first one.' : 'No vehicles match these filters.'}</p>
        )}

        <Pagination pager={pager} noun="vehicles" />
      </div>

      {/* ------------------------- add / edit modal ------------------------- */}
      {formOpen && (
        <Modal
          size="lg"
          title={editing ? 'Edit Vehicle' : 'Add New Vehicle'}
          subtitle={editing ? `Updating ${editing.name}` : 'Fill in the details - photos can be added right away.'}
          onClose={closeForm}
          footer={
            <>
              <button type="button" className="ad-btn" onClick={closeForm} disabled={saving}>
                Cancel
              </button>
              <button type="submit" form="vehicle-form" className="ad-btn ad-btn--primary" disabled={saving}>
                {uploading ? 'Uploading photos...' : saving ? 'Saving...' : editing ? 'Update Vehicle' : 'Add Vehicle'}
              </button>
            </>
          }
        >
          <form id="vehicle-form" className="vh-form" onSubmit={handleSubmit}>
            <label className="ad-field">
              <span>Vehicle type</span>
              <select name="type" value={form.type} onChange={handleChange} disabled={!!editing}>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {capitalize(t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="ad-field">
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="available">Available</option>
                <option value="booked">Rented</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </label>

            <label className="ad-field vh-span2">
              <span>Vehicle name</span>
              <input name="name" placeholder="e.g. Honda Activa 6G" value={form.name} onChange={handleChange} required />
            </label>

            <label className="ad-field">
              <span>Brand</span>
              <input name="brand" placeholder="e.g. Honda" value={form.brand} onChange={handleChange} />
            </label>
            <label className="ad-field">
              <span>Number plate</span>
              <input name="numberPlate" placeholder="e.g. AP 09 AB 1234" value={form.numberPlate} onChange={handleChange} />
            </label>

            <label className="ad-field">
              <span>Price per day (₹)</span>
              <input name="pricePerDay" type="number" min="0" placeholder="249" value={form.pricePerDay} onChange={handleChange} required />
            </label>
            <label className="ad-field">
              <span>Rating</span>
              <input name="rating" type="number" step="0.1" min="0" max="5" placeholder="4.5" value={form.rating} onChange={handleChange} />
            </label>

            <label className="ad-field">
              <span>Engine</span>
              <input name="cc" placeholder="e.g. 125cc" value={form.cc} onChange={handleChange} />
            </label>
            <label className="ad-field">
              <span>Mileage</span>
              <input name="mileage" placeholder="e.g. 45 kmpl" value={form.mileage} onChange={handleChange} />
            </label>

            <label className="ad-field">
              <span>Transmission</span>
              <select name="transmission" value={form.transmission} onChange={handleChange}>
                <option>Manual</option>
                <option>Automatic</option>
              </select>
            </label>
            <label className="ad-field">
              <span>Fuel</span>
              <select name="fuel" value={form.fuel} onChange={handleChange}>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Electric</option>
              </select>
            </label>

            <label className="ad-field">
              <span>Seats</span>
              <input name="seats" type="number" min="1" placeholder="2" value={form.seats} onChange={handleChange} />
            </label>
            <label className="ad-field">
              <span>Location</span>
              <input name="location" placeholder="City, State" value={form.location} onChange={handleChange} />
            </label>

            <label className="ad-field vh-span2">
              <span>About this vehicle</span>
              <textarea name="about" rows="3" placeholder="A short description riders will see" value={form.about} onChange={handleChange} />
            </label>

            <div className="ad-field vh-span2">
              <span>Photos (up to 5 - different angles)</span>
              <label className="vh-upload">
                <Icon name="upload" size={20} />
                <strong>{newPhotos.length > 0 ? `${newPhotos.length} photo(s) selected` : 'Click to choose photos'}</strong>
                <small>PNG, JPG or WEBP</small>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  multiple
                  onChange={(e) => setNewPhotos(Array.from(e.target.files).slice(0, 5))}
                />
              </label>
            </div>

            {editing && photoCount > 0 && (
              <div className="vh-span2 vh-existing">
                {Array.from({ length: photoCount }).map((_, index) => (
                  <div key={index} className="vh-existing__item">
                    <img src={vehicleImageUrl(editing, index)} alt={`Photo ${index + 1}`} />
                    <button type="button" onClick={() => handleRemovePhoto(index)} aria-label={`Remove photo ${index + 1}`}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* ---------------------------- details modal ---------------------------- */}
      {viewing && (
        <Modal
          size="md"
          title={viewing.vehicle.name}
          subtitle={`${capitalize(viewing.vehicle.type)} • ${brandOf(viewing.vehicle)}`}
          onClose={() => setViewing(null)}
          footer={
            <>
              <button type="button" className="ad-btn" onClick={() => setViewing(null)}>
                Close
              </button>
              <button
                type="button"
                className="ad-btn ad-btn--primary"
                onClick={() => {
                  const v = viewing.vehicle;
                  setViewing(null);
                  openEdit(v);
                }}
              >
                <Icon name="pencil" size={15} /> Edit Vehicle
              </button>
            </>
          }
        >
          {(() => {
            const v = viewing.vehicle;
            const count = vehicleImageCount(v);
            const facts = [
              ['Price / day', formatCurrency(v.pricePerDay)],
              ['Status', STATUS_LABEL[statusOf(v)] || capitalize(statusOf(v))],
              ['Number plate', v.numberPlate || '—'],
              ['Engine', v.cc || '—'],
              ['Mileage', v.mileage || '—'],
              ['Transmission', v.transmission || '—'],
              ['Fuel', v.fuel || '—'],
              ['Seats', v.seats || '—'],
              ['Rating', v.rating ? `${v.rating} (${v.trips || 0} trips)` : '—'],
              ['Location', v.location || '—'],
            ];
            return (
              <div className="vh-detail">
                <div className="vh-gallery">
                  <div className="vh-gallery__main">
                    {count > 0 ? <img src={vehicleImageUrl(v, viewing.photo)} alt={v.name} /> : <VehicleThumb type={v.type} width={120} height={90} />}
                  </div>
                  {count > 1 && (
                    <div className="vh-gallery__thumbs">
                      {Array.from({ length: count }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={i === viewing.photo ? 'is-active' : ''}
                          onClick={() => setViewing((s) => ({ ...s, photo: i }))}
                          aria-label={`Show photo ${i + 1}`}
                        >
                          <img src={vehicleImageUrl(v, i)} alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <dl className="vh-facts">
                  {facts.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                {v.about && <p className="vh-about">{v.about}</p>}
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}

export default AdminVehicles;