import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import SecureImage from './SecureImage.jsx';
import {
  LICENSE_STATUS,
  classLabel,
  formatLicenseDob,
  formatMobile,
  mobileDigits,
  licenseCoversVehicle,
} from '../utils/licenseValidation.js';
import '../styles/Booking.validation.css';
import '../styles/LicenseSection.css';

/* ---------- constants & helpers ---------- */

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const APPLICATION_NO_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\-/ ]{4,29}$/;

const LICENCE_TYPES = [
  { value: '2w', label: 'Two Wheeler (Bike / Scooter)', classes: ['2w'] },
  { value: '4w', label: 'Four Wheeler (Car)', classes: ['4w'] },
  { value: 'both', label: 'Both (Two Wheeler + Four Wheeler)', classes: ['2w', '4w'] },
];

const todayString = () => new Date().toISOString().slice(0, 10);
const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

function typeFromClasses(classes = []) {
  if (classes.includes('2w') && classes.includes('4w')) return 'both';
  if (classes.includes('4w')) return '4w';
  if (classes.includes('2w')) return '2w';
  return '';
}

function isAdult(dob) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return d <= cutoff;
}

function checkPhoto(file, label) {
  if (!file) return `Upload the ${label} of your licence`;
  if (!PHOTO_TYPES.includes(file.type)) return 'Use a JPG or PNG image';
  if (file.size > MAX_PHOTO_BYTES) return 'Image must be under 5 MB';
  return '';
}

function validate(v) {
  const e = {};
  if (v.fullName.trim().length < 2) e.fullName = 'Enter your full name as printed on the licence';
  if (!v.mobile) e.mobile = 'Enter your mobile number';
  else if (!MOBILE_PATTERN.test(v.mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
  if (!v.dob) e.dob = 'Select your date of birth';
  else if (!isAdult(v.dob)) e.dob = 'You must be at least 18 years old';
  if (!v.licenseNumber.trim()) e.licenseNumber = 'Enter your licence application number';
  else if (!APPLICATION_NO_PATTERN.test(v.licenseNumber.trim()))
    e.licenseNumber = 'Enter a valid number (5–30 letters, digits, - or /)';
  if (!v.licenceType) e.licenceType = 'Select the type of licence';
  if (!v.issueDate) e.issueDate = 'Select the issue date';
  else if (v.issueDate > todayString()) e.issueDate = 'Issue date cannot be in the future';
  if (!v.validityDate) e.validityDate = 'Select the validity date';
  else if (v.validityDate <= todayString()) e.validityDate = 'This licence has already expired';
  else if (v.issueDate && v.validityDate <= v.issueDate) e.validityDate = 'Must be after the issue date';
  const front = checkPhoto(v.front, 'front side');
  if (front) e.front = front;
  const back = checkPhoto(v.back, 'back side');
  if (back) e.back = back;
  if (v.address.trim().length < 10) e.address = 'Enter your full address (at least 10 characters)';
  return e;
}

/* ---------- small icons ---------- */

const ICON_PATHS = {
  card: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm4 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-3 8h6v-.5C10 14.6 8.5 14 7 14s-3 .6-3 1.5V16zm9-7h6v2h-6zm0 4h6v2h-6z',
  user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z',
  phone: 'M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z',
  calendar: 'M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2zM5 10h14v10H5z',
  doc: 'M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm7 1.5L18.5 9H13zM8 13h8v2H8zm0 4h8v2H8z',
  car: 'M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v5h-2v2h-3v-2H8v2H5v-2H3v-5a1 1 0 0 1 1-1zm3.1-4l-1 3h9.8l-1-3zM6.5 13.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm11 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z',
  image: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM5 19h14v-4l-3.5-4-4 4.5-2.5-2.5L5 17z',
  pin: 'M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z',
};

function Ico({ name }) {
  return (
    <svg className="ld-ico" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/* ---------- drag & drop upload box ---------- */

function UploadBox({ id, label, side, file, onFile, error, inputRef, onTouched }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!file) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f) => {
    onFile(f || null);
    onTouched();
  };

  const open = () => inputRef.current?.click();

  return (
    <div className="ld-field">
      <label className="ld-label" htmlFor={id}>
        <Ico name="image" />
        <span>
          {label} <small>({side})</small>
        </span>
      </label>

      <div
        className={`ld-drop${dragging ? ' is-dragging' : ''}${error ? ' has-error' : ''}${file ? ' has-file' : ''}`}
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
      >
        {file && preview ? (
          <div className="ld-drop-preview">
            <img src={preview} alt={`${side} preview`} />
            <div className="ld-drop-file">
              <span title={file.name}>{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  pick(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <>
            <svg className="ld-cloud" viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8z" />
              <path d="M12 17v-6M9.5 13.5 12 11l2.5 2.5" />
            </svg>
            <p className="ld-drop-main">Click to upload or drag and drop</p>
            <p className="ld-drop-sub">JPG, PNG (Max 5MB)</p>
          </>
        )}
        <input
          id={id}
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

/* ---------- main component ---------- */

function LicenseSection({ vehicleType }) {
  const { user, updateUser } = useApp();

  const status = user.licenseStatus || 'not_submitted';
  const statusInfo = LICENSE_STATUS[status] || LICENSE_STATUS.not_submitted;
  const submittedOnce = status !== 'not_submitted';

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user.licenseFullName || user.name || '');
  const [mobile, setMobile] = useState(mobileDigits(user.licenseMobile || user.phone));
  const [dob, setDob] = useState(toDateInput(user.licenseDob));
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenceType, setLicenceType] = useState(typeFromClasses(user.licenseClasses));
  const [issueDate, setIssueDate] = useState(toDateInput(user.licenseIssueDate));
  const [validityDate, setValidityDate] = useState(toDateInput(user.licenseValidUntil));
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [address, setAddress] = useState(user.licenseAddress || '');

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const refs = {
    fullName: useRef(null),
    mobile: useRef(null),
    dob: useRef(null),
    licenseNumber: useRef(null),
    licenceType: useRef(null),
    issueDate: useRef(null),
    validityDate: useRef(null),
    front: useRef(null),
    back: useRef(null),
    address: useRef(null),
  };

  const values = { fullName, mobile, dob, licenseNumber, licenceType, issueDate, validityDate, front, back, address };
  const errors = useMemo(
    () => validate(values),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fullName, mobile, dob, licenseNumber, licenceType, issueDate, validityDate, front, back, address]
  );

  const showError = (f) => (touched[f] || submitted) && errors[f];
  const touch = (f) => setTouched((p) => ({ ...p, [f]: true }));
  const cls = (f) => (showError(f) ? 'has-error' : '');
  const err = (f) =>
    showError(f) && (
      <span className="field-error" role="alert">
        {errors[f]}
      </span>
    );

  const showForm = status === 'not_submitted' || status === 'rejected' || editing;
  const covers = licenseCoversVehicle(user.licenseClasses, vehicleType);
  const photoKey = user.licenseSubmittedAt || 'none';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError('');

    const order = ['fullName', 'mobile', 'dob', 'licenseNumber', 'licenceType', 'issueDate', 'validityDate', 'front', 'back', 'address'];
    const firstInvalid = order.find((f) => errors[f]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus?.();
      refs[firstInvalid].current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      return;
    }

    const classes = LICENCE_TYPES.find((t) => t.value === licenceType).classes;
    const formData = new FormData();
    formData.append('fullName', fullName.trim());
    formData.append('mobile', mobile);
    formData.append('dob', dob);
    formData.append('licenseNumber', licenseNumber.trim());
    formData.append('licenseClasses', classes.join(','));
    formData.append('issueDate', issueDate);
    formData.append('validityDate', validityDate);
    formData.append('address', address.trim());
    formData.append('licenseFront', front);
    formData.append('licenseBack', back);

    try {
      setSaving(true);
      // no manual Content-Type: the browser must generate the multipart boundary
      const res = await api.post('/licenses/upload', formData);
      updateUser(res.data.data); // status is now 'pending'
      setEditing(false);
      setSubmitted(false);
      setTouched({});
      setLicenseNumber('');
      setFront(null);
      setBack(null);
    } catch (e2) {
      setServerError(e2.response?.data?.message || 'Could not submit your licence. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ld-card">
      {/* ---------- header ---------- */}
      <div className="ld-head">
        <span className="ld-head-icon">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
            <path d={ICON_PATHS.card} />
          </svg>
        </span>
        <div>
          <h3>Licence Documentation</h3>
          <p>Please provide your driving licence details and upload the required documents.</p>
        </div>
      </div>

      {submittedOnce && (
        <div className={`ld-banner ld-banner--${status}`} role="status">
          <span className="ld-banner-dot" aria-hidden="true" />
          <div>
            <strong>{statusInfo.text}</strong>
            <p>
              {status === 'pending' &&
                'Your licence is with our team. You can keep booking meanwhile — your booking stays Pending and is confirmed as soon as the admin verifies your licence.'}
              {status === 'verified' && 'Your licence has been verified. You are all set to book.'}
              {status === 'rejected' && 'Your licence was rejected. Please correct the details below and submit it again.'}
            </p>
          </div>
        </div>
      )}

      {submittedOnce && !covers && vehicleType && (
        <p className="ld-alert" role="alert">
          This licence doesn’t cover {vehicleType === 'car' ? '4-wheelers (cars)' : '2-wheelers (bikes & scooters)'}.
          Resubmit it with the right type of licence selected.
        </p>
      )}

      {/* ---------- submitted summary ---------- */}
      {submittedOnce && !showForm && (
        <div className="ld-summary">
          <h4 className="ld-section-title">Licence Details</h4>
          <dl className="ld-tiles">
            {[
              ['user', 'Full Name', user.licenseFullName || '—'],
              ['phone', 'Mobile Number', formatMobile(user.licenseMobile)],
              ['calendar', 'Date of Birth', formatLicenseDob(user.licenseDob)],
              ['doc', 'Application Number', user.licenseNumber || '—'],
              ['car', 'Type of Licence', user.licenseClasses?.length ? user.licenseClasses.map(classLabel).join(' + ') : '—'],
              ['calendar', 'Issue Date', formatLicenseDob(user.licenseIssueDate)],
              ['calendar', 'Validity Date', formatLicenseDob(user.licenseValidUntil)],
              ['pin', 'Address', user.licenseAddress || '—', true],
            ].map(([icon, label, value, wide]) => (
              <div key={label} className={`ld-tile${wide ? ' ld-tile--wide' : ''}`}>
                <span className="ld-tile-icon"><Ico name={icon} /></span>
                <div>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              </div>
            ))}
          </dl>

          {(user.hasLicenseImage || user.hasLicenseBackImage) && (
            <>
              <h4 className="ld-section-title">Licence Photos</h4>
              <div className="ld-photos">
                {user.hasLicenseImage && (
                  <figure>
                    <div className="ld-photo-frame">
                      <SecureImage key={`front-${photoKey}`} src={`/users/${user.id || user._id}/license-photo`} alt="Front of your licence" />
                    </div>
                    <figcaption>Front Side</figcaption>
                  </figure>
                )}
                {user.hasLicenseBackImage && (
                  <figure>
                    <div className="ld-photo-frame">
                      <SecureImage key={`back-${photoKey}`} src={`/users/${user.id || user._id}/license-photo/back`} alt="Back of your licence" />
                    </div>
                    <figcaption>Back Side</figcaption>
                  </figure>
                )}
              </div>
            </>
          )}

          <div className="ld-summary-actions">
            <button type="button" className="btn btn-outline" onClick={() => setEditing(true)}>
              Edit &amp; resubmit
            </button>
          </div>
        </div>
      )}

      {/* ---------- form ---------- */}
      {showForm && (
        <form className="ld-form" onSubmit={handleSubmit} noValidate>
          <div className="ld-grid">
            <div className="ld-field">
              <label className="ld-label" htmlFor="ldFullName"><Ico name="user" /> Full Name</label>
              <input
                id="ldFullName"
                ref={refs.fullName}
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                className={cls('fullName')}
                aria-invalid={Boolean(showError('fullName'))}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => touch('fullName')}
              />
              {err('fullName')}
            </div>

            <div className="ld-field">
              <label className="ld-label" htmlFor="ldMobile"><Ico name="phone" /> Mobile Number</label>
              <input
                id="ldMobile"
                ref={refs.mobile}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                placeholder="Enter 10 digit mobile number"
                value={mobile}
                className={cls('mobile')}
                aria-invalid={Boolean(showError('mobile'))}
                onChange={(e) => setMobile(mobileDigits(e.target.value))}
                onBlur={() => touch('mobile')}
              />
              {err('mobile')}
            </div>

            <div className="ld-field">
              <label className="ld-label" htmlFor="ldDob"><Ico name="calendar" /> Date of Birth</label>
              <input
                id="ldDob"
                ref={refs.dob}
                type="date"
                max={todayString()}
                value={dob}
                className={cls('dob')}
                aria-invalid={Boolean(showError('dob'))}
                onChange={(e) => setDob(e.target.value)}
                onBlur={() => touch('dob')}
              />
              {err('dob')}
            </div>

            <div className="ld-field">
              <label className="ld-label" htmlFor="ldNumber"><Ico name="doc" /> Licence Application Number</label>
              <input
                id="ldNumber"
                ref={refs.licenseNumber}
                type="text"
                placeholder="Enter licence application number"
                value={licenseNumber}
                className={cls('licenseNumber')}
                aria-invalid={Boolean(showError('licenseNumber'))}
                onChange={(e) => setLicenseNumber(e.target.value)}
                onBlur={() => touch('licenseNumber')}
              />
              {err('licenseNumber')}
            </div>

            <div className="ld-field">
              <label className="ld-label" htmlFor="ldType"><Ico name="car" /> Type of Licence</label>
              <select
                id="ldType"
                ref={refs.licenceType}
                value={licenceType}
                className={cls('licenceType')}
                aria-invalid={Boolean(showError('licenceType'))}
                onChange={(e) => {
                  setLicenceType(e.target.value);
                  touch('licenceType');
                }}
                onBlur={() => touch('licenceType')}
              >
                <option value="">Select licence type</option>
                {LICENCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {err('licenceType')}
            </div>

            <div className="ld-field">
              <label className="ld-label" htmlFor="ldIssue"><Ico name="calendar" /> Issue Date</label>
              <input
                id="ldIssue"
                ref={refs.issueDate}
                type="date"
                max={todayString()}
                value={issueDate}
                className={cls('issueDate')}
                aria-invalid={Boolean(showError('issueDate'))}
                onChange={(e) => setIssueDate(e.target.value)}
                onBlur={() => touch('issueDate')}
              />
              {err('issueDate')}
            </div>

            <div className="ld-field">
              <label className="ld-label" htmlFor="ldValid"><Ico name="calendar" /> Validity Date</label>
              <input
                id="ldValid"
                ref={refs.validityDate}
                type="date"
                min={issueDate || undefined}
                value={validityDate}
                className={cls('validityDate')}
                aria-invalid={Boolean(showError('validityDate'))}
                onChange={(e) => setValidityDate(e.target.value)}
                onBlur={() => touch('validityDate')}
              />
              {err('validityDate')}
            </div>

            <div className="ld-field ld-field--address">
              <label className="ld-label" htmlFor="ldAddress"><Ico name="pin" /> Address</label>
              <textarea
                id="ldAddress"
                ref={refs.address}
                rows={3}
                placeholder="Enter your full address"
                value={address}
                className={cls('address')}
                aria-invalid={Boolean(showError('address'))}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={() => touch('address')}
              />
              {err('address')}
            </div>
          </div>

          <div className="ld-grid ld-uploads">
            <UploadBox
              id="ldFront"
              label="Upload Front Image"
              side="Licence Front Side"
              file={front}
              onFile={setFront}
              error={showError('front')}
              inputRef={refs.front}
              onTouched={() => touch('front')}
            />
            <UploadBox
              id="ldBack"
              label="Upload Back Image"
              side="Licence Back Side"
              file={back}
              onFile={setBack}
              error={showError('back')}
              inputRef={refs.back}
              onTouched={() => touch('back')}
            />
          </div>

          {serverError && (
            <p className="ld-alert" role="alert">
              {serverError}
            </p>
          )}

          <div className="ld-form-actions">
            {editing && (
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
            )}
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default LicenseSection;