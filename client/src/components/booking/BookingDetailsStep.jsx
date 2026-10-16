import React, { useMemo, useState } from 'react';
import { PICKUP_LOCATIONS } from '../../utils/bookingValidation.js';
import { ADD_ON_OPTIONS, formatINR } from '../../utils/bookingPricing.js';
import { FREE_HELMETS, HELMET_KEY, HELMET_PRICE, MAX_HELMETS } from '../../utils/rentalPricing.js';
import AddOnIcon from './AddOnIcon.jsx';
import { Ico, TIME_OPTIONS, TypeTag, VehicleThumb, todayString } from './BookingShared.jsx';
import '../../styles/Booking.validation.css';
import '../../styles/BookingSteps.css';
import '../../styles/BookingAddons.css';

function validate(details) {
  const e = {};
  const today = todayString();
  if (!details.pickupDate) e.pickupDate = 'Select the pickup date';
  else if (details.pickupDate < today) e.pickupDate = 'Pickup date cannot be in the past';

  if (!details.dropoffDate) e.dropoffDate = 'Select the drop-off date';
  else if (details.pickupDate && details.dropoffDate < details.pickupDate)
    e.dropoffDate = 'Drop-off must be on or after the pickup date';
  else if (
    details.pickupDate &&
    details.dropoffDate === details.pickupDate &&
    TIME_OPTIONS.indexOf(details.dropoffTime) <= TIME_OPTIONS.indexOf(details.pickupTime)
  )
    e.dropoffTime = 'Drop-off time must be after the pickup time';
  return e;
}

function BookingDetailsStep({ vehicle, details, onChange, pricing, onNext, onCancel }) {
  const [submitted, setSubmitted] = useState(false);
  const errors = useMemo(() => validate(details), [details]);
  const show = (f) => submitted && errors[f];
  const err = (f) =>
    show(f) && (
      <span className="field-error" role="alert">
        {errors[f]}
      </span>
    );

  const helmets = details.helmets ?? FREE_HELMETS;
  const setHelmets = (n) => onChange({ helmets: Math.min(MAX_HELMETS, Math.max(FREE_HELMETS, n)) });

  const toggleAddOn = (key) => {
    const has = details.addOns.includes(key);
    onChange({ addOns: has ? details.addOns.filter((k) => k !== key) : [...details.addOns, key] });
  };

  const handleNext = () => {
    setSubmitted(true);
    if (Object.keys(errors).length === 0) onNext();
  };

  return (
    <div className="bk-grid">
      {/* ---------------- left column ---------------- */}
      <div className="bk-col">
        <section className="bk-card">
          <h2 className="bk-card-title">Booking Details</h2>

          <div className="bk-vehicle">
            <VehicleThumb vehicle={vehicle} className="bk-thumb--lg" />
            <div>
              <h3>{vehicle.name}</h3>
              <TypeTag type={vehicle.type} />
              <p className="bk-price-day">
                <strong>{formatINR(vehicle.pricePerDay)}</strong> / day
              </p>
            </div>
          </div>

          <div className="bk-field">
            <label className="bk-label" htmlFor="bkLocation">
              Pickup Location
            </label>
            <div className="bk-input bk-input--icon">
              <Ico name="pin" />
              <input
                id="bkLocation"
                type="text"
                value={details.pickupLocation || PICKUP_LOCATIONS[0]}
                readOnly
                aria-readonly="true"
                className="bk-fixed-location"
              />
            </div>
          </div>

          <div className="bk-field">
            <span className="bk-label">Pickup Date &amp; Time</span>
            <div className="bk-row">
              <div className={`bk-input bk-input--icon${show('pickupDate') ? ' has-error' : ''}`}>
                <Ico name="calendar" />
                <input
                  type="date"
                  aria-label="Pickup date"
                  min={todayString()}
                  value={details.pickupDate}
                  onChange={(e) => onChange({ pickupDate: e.target.value })}
                />
              </div>
              <div className="bk-input bk-input--icon">
                <Ico name="clock" />
                <select
                  aria-label="Pickup time"
                  value={details.pickupTime}
                  onChange={(e) => onChange({ pickupTime: e.target.value })}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            {err('pickupDate')}
          </div>

          <div className="bk-field">
            <span className="bk-label">Drop-off Date &amp; Time</span>
            <div className="bk-row">
              <div className={`bk-input bk-input--icon${show('dropoffDate') ? ' has-error' : ''}`}>
                <Ico name="calendar" />
                <input
                  type="date"
                  aria-label="Drop-off date"
                  min={details.pickupDate || todayString()}
                  value={details.dropoffDate}
                  onChange={(e) => onChange({ dropoffDate: e.target.value })}
                />
              </div>
              <div className={`bk-input bk-input--icon${show('dropoffTime') ? ' has-error' : ''}`}>
                <Ico name="clock" />
                <select
                  aria-label="Drop-off time"
                  value={details.dropoffTime}
                  onChange={(e) => onChange({ dropoffTime: e.target.value })}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            {err('dropoffDate')}
            {err('dropoffTime')}
          </div>
        </section>

        <section className="bk-card">
          <h2 className="bk-card-title bk-card-title--icon">
            <span className="bk-badge-icon">
              <Ico name="addon" size={15} />
            </span>
            Add-ons
          </h2>

          <ul className="bk-addons">
            {ADD_ON_OPTIONS.map((a) => {
              if (a.key === HELMET_KEY) {
                const extra = Math.max(0, helmets - FREE_HELMETS);
                return (
                  <li key={a.key}>
                    <div className="bk-addon is-checked bk-addon--helmet">
                      <input type="checkbox" checked readOnly disabled aria-label="One helmet is included free" />
                      <span className="bk-addon-icon" aria-hidden="true">
                        <AddOnIcon name="helmet" />
                      </span>
                      <span className="bk-addon-name">
                        Helmet
                        <small className="bk-addon-note">
                          {FREE_HELMETS} free · {formatINR(HELMET_PRICE)} for each extra helmet
                        </small>
                      </span>
                      <span className="bk-addon-price bk-helmet-ctrl">
                        <span className="bk-qty" role="group" aria-label="Number of helmets">
                          <button type="button" aria-label="Remove a helmet" onClick={() => setHelmets(helmets - 1)} disabled={helmets <= FREE_HELMETS}>
                            −
                          </button>
                          <output aria-live="polite">{helmets}</output>
                          <button type="button" aria-label="Add a helmet" onClick={() => setHelmets(helmets + 1)} disabled={helmets >= MAX_HELMETS}>
                            +
                          </button>
                        </span>
                        <span className="bk-helmet-total">{extra > 0 ? formatINR(extra * HELMET_PRICE) : 'Free'}</span>
                      </span>
                    </div>
                  </li>
                );
              }
              const checked = details.addOns.includes(a.key);
              return (
                <li key={a.key}>
                  <label className={`bk-addon${checked ? ' is-checked' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleAddOn(a.key)} />
                    <span className="bk-addon-icon" aria-hidden="true">
                      <AddOnIcon name={a.key} />
                    </span>
                    <span className="bk-addon-name">{a.label}</span>
                    <span className="bk-addon-price">{formatINR(a.price)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* ---------------- right column ---------------- */}
      <aside className="bk-col">
        <section className="bk-card bk-sticky">
          <h2 className="bk-card-title bk-card-title--icon">
            <span className="bk-badge-icon">
              <Ico name="doc" size={15} />
            </span>
            Price Details
          </h2>

          <dl className="bk-lines">
            <div>
              <dt>Base ({pricing.days || 0} {pricing.days === 1 ? 'day' : 'days'})</dt>
              <dd>{formatINR(pricing.base)}</dd>
            </div>
            {pricing.addOns.map((a) => (
              <div key={a.key}>
                <dt>{a.label}</dt>
                <dd>{a.amount === 0 ? 'Free' : formatINR(a.amount)}</dd>
              </div>
            ))}
            <div>
              <dt>Platform Fee</dt>
              <dd>{formatINR(pricing.platformFee)}</dd>
            </div>
          </dl>

          <div className="bk-total">
            <span>Total Amount</span>
            <strong>{formatINR(pricing.totalAmount)}</strong>
          </div>

          {submitted && Object.keys(errors).length > 0 && (
            <p className="wizard-error" role="alert">
              Please fix the highlighted fields to continue.
            </p>
          )}

          <button type="button" className="bk-btn bk-btn--primary" onClick={handleNext}>
            Continue to Pay
          </button>
          <button type="button" className="bk-btn bk-btn--outline" onClick={onCancel}>
            Cancel Booking
          </button>
        </section>
      </aside>
    </div>
  );
}

export default BookingDetailsStep;