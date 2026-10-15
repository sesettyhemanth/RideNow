import React, { useState } from 'react';
import { formatINR } from '../../utils/bookingPricing.js';
import { Ico, TypeTag, VehicleThumb, formatShortDate } from './BookingShared.jsx';
import '../../styles/Booking.validation.css';
import '../../styles/BookingWizard.css';
import '../../styles/BookingSteps.css';

const METHODS = [
  { key: 'upi', title: 'UPI', sub: 'Pay using Google Pay, PhonePe, Paytm, etc.', icon: 'upi', brands: ['G Pay', 'PhonePe', 'Paytm'] },
  { key: 'card', title: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: 'card', brands: ['VISA', 'Mastercard', 'RuPay'] },
  { key: 'netbanking', title: 'Net Banking', sub: 'Pay directly from your bank account', icon: 'bank', brands: [] },
  { key: 'cod', title: 'Cash on Delivery', sub: 'Pay in cash when you pick up the vehicle', icon: 'wallet', brands: [] },
];

const UPI_PATTERN = /^[\w.-]{2,}@[A-Za-z]{2,}$/;

function validate(payment) {
  const e = {};
  if (payment.method === 'upi' && !UPI_PATTERN.test(payment.upiId.trim())) {
    e.upiId = 'Enter a valid UPI ID (for example name@bank)';
  }
  if (payment.method === 'card') {
    if (payment.cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = 'Enter the 16-digit card number';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiry)) e.expiry = 'Use MM/YY';
    if (!/^\d{3,4}$/.test(payment.cvv)) e.cvv = 'Enter the CVV';
    if (payment.cardName.trim().length < 2) e.cardName = 'Enter the name on the card';
  }
  return e;
}

function PaymentStep({ vehicle, details, pricing, payment, paid, onChange, onPaid, onContinue, onBack }) {
  const [submitted, setSubmitted] = useState(false);
  const errors = validate(payment);
  const err = (f) =>
    submitted &&
    errors[f] && (
      <span className="field-error" role="alert">
        {errors[f]}
      </span>
    );
  const cls = (f) => (submitted && errors[f] ? ' has-error' : '');

  const handlePay = () => {
    if (paid) return onContinue();
    setSubmitted(true);
    if (Object.keys(errors).length === 0) onPaid();
    return undefined;
  };

  const formatCard = (v) =>
    v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const payLabel = paid ? 'Continue' : payment.method === 'cod' ? 'Confirm Order' : 'Pay Now';

  return (
    <div className="payment-page bk-pay">
      <header className="bk-pay-head">
        <span className="bk-pay-head-icon">
          <Ico name="card" size={26} />
        </span>
        <div>
          <h2>Payment</h2>
          <p>Choose your preferred payment method and complete the payment to confirm your booking.</p>
        </div>
      </header>

      <div className="bk-grid bk-grid--pay">
        {/* ---------------- methods ---------------- */}
        <section className="bk-card">
          <h3 className="bk-card-title">Select Payment Method</h3>

          <div className="bk-methods" role="radiogroup" aria-label="Payment method">
            {METHODS.map((m) => {
              const selected = payment.method === m.key;
              return (
                <div key={m.key} className={`bk-method${selected ? ' is-selected' : ''}`}>
                  <label className="bk-method-row">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selected}
                      onChange={() => {
                        setSubmitted(false);
                        onChange({ method: m.key });
                      }}
                    />
                    <span className="bk-radio" aria-hidden="true" />
                    <span className="bk-method-icon">
                      <Ico name={m.icon} size={22} />
                    </span>
                    <span className="bk-method-text">
                      <strong>{m.title}</strong>
                      <small>{m.sub}</small>
                    </span>
                    <span className="bk-brands" aria-hidden="true">
                      {m.brands.map((b) => (
                        <span key={b} className={`bk-brand bk-brand--${b.replace(/\s/g, '').toLowerCase()}`}>
                          {b}
                        </span>
                      ))}
                    </span>
                  </label>

                  {selected && m.key === 'upi' && (
                    <div className="bk-method-body">
                      <label className="bk-label" htmlFor="payUpi">
                        UPI ID
                      </label>
                      <input
                        id="payUpi"
                        className={`bk-plain${cls('upiId')}`}
                        type="text"
                        placeholder="yourname@bank"
                        value={payment.upiId}
                        onChange={(e) => onChange({ upiId: e.target.value })}
                      />
                      {err('upiId')}
                    </div>
                  )}

                  {selected && m.key === 'card' && (
                    <div className="bk-method-body bk-card-fields">
                      <div className="bk-span-2">
                        <label className="bk-label" htmlFor="payCard">
                          Card Number
                        </label>
                        <input
                          id="payCard"
                          className={`bk-plain${cls('cardNumber')}`}
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="1234 5678 9012 3456"
                          value={payment.cardNumber}
                          onChange={(e) => onChange({ cardNumber: formatCard(e.target.value) })}
                        />
                        {err('cardNumber')}
                      </div>
                      <div>
                        <label className="bk-label" htmlFor="payExp">
                          Expiry
                        </label>
                        <input
                          id="payExp"
                          className={`bk-plain${cls('expiry')}`}
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="MM/YY"
                          value={payment.expiry}
                          onChange={(e) => onChange({ expiry: formatExpiry(e.target.value) })}
                        />
                        {err('expiry')}
                      </div>
                      <div>
                        <label className="bk-label" htmlFor="payCvv">
                          CVV
                        </label>
                        <input
                          id="payCvv"
                          className={`bk-plain${cls('cvv')}`}
                          type="password"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          maxLength={4}
                          placeholder="•••"
                          value={payment.cvv}
                          onChange={(e) => onChange({ cvv: e.target.value.replace(/\D/g, '') })}
                        />
                        {err('cvv')}
                      </div>
                      <div className="bk-span-2">
                        <label className="bk-label" htmlFor="payName">
                          Name on Card
                        </label>
                        <input
                          id="payName"
                          className={`bk-plain${cls('cardName')}`}
                          autoComplete="cc-name"
                          placeholder="Name as printed on the card"
                          value={payment.cardName}
                          onChange={(e) => onChange({ cardName: e.target.value })}
                        />
                        {err('cardName')}
                      </div>
                    </div>
                  )}

                  {selected && m.key === 'cod' && (
                    <div className="bk-method-body">
                      <small>
                        Pay the total amount in cash when you pick up the vehicle. Please keep the exact amount ready.
                      </small>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bk-secure">
            <span className="bk-secure-icon">
              <Ico name="shield" size={20} />
            </span>
            <div>
              <strong>Your payment is secure and encrypted</strong>
              <small>We use industry-standard security to keep your information safe.</small>
            </div>
          </div>
        </section>

        {/* ---------------- booking summary ---------------- */}
        <aside className="bk-card bk-sticky">
          <div className="bk-summary-head">
            <h3 className="bk-card-title">Booking Summary</h3>
            <button type="button" className="bk-edit" onClick={onBack}>
              <Ico name="edit" size={13} /> Edit
            </button>
          </div>

          <div className="bk-vehicle">
            <VehicleThumb vehicle={vehicle} />
            <div>
              <h4>{vehicle.name}</h4>
              <TypeTag type={vehicle.type} />
              <p className="bk-price-day">
                <strong>{formatINR(vehicle.pricePerDay)}</strong> / day
              </p>
            </div>
          </div>

          <dl className="bk-summary-rows">
            <div>
              <dt><Ico name="pin" size={14} /> Pickup Location</dt>
              <dd>{details.pickupLocation}</dd>
            </div>
            <div>
              <dt><Ico name="calendar" size={14} /> Pickup Date</dt>
              <dd>{formatShortDate(details.pickupDate)}</dd>
            </div>
            <div>
              <dt><Ico name="clock" size={14} /> Pickup Time</dt>
              <dd>{details.pickupTime}</dd>
            </div>
            <div>
              <dt><Ico name="calendar" size={14} /> Drop-off Date</dt>
              <dd>{formatShortDate(details.dropoffDate)}</dd>
            </div>
            <div>
              <dt><Ico name="clock" size={14} /> Drop-off Time</dt>
              <dd>{details.dropoffTime}</dd>
            </div>
          </dl>

          <div className="bk-summary-addons">
            <div className="bk-summary-addons-head">
              <span><Ico name="addon" size={14} /> Add-ons</span>
              <strong>{formatINR(pricing.addOnsTotal)}</strong>
            </div>
            <small>{pricing.addOns.length ? pricing.addOns.map((a) => a.label).join(' + ') : 'None selected'}</small>
          </div>

          <div className="bk-summary-estimate">
            <span><Ico name="doc" size={14} /> Estimated Rental Price</span>
            <strong>{formatINR(pricing.rentalPrice)}</strong>
          </div>

          <div className="bk-total bk-total--boxed">
            <span>Total Amount</span>
            <strong>{formatINR(pricing.totalAmount)}</strong>
          </div>

          <button type="button" className="bk-btn bk-btn--primary" onClick={handlePay}>
            <Ico name="lock" size={16} /> {payLabel}
          </button>
          <button type="button" className="bk-btn bk-btn--outline" onClick={onBack}>
            Back to Booking Details
          </button>
        </aside>
      </div>
    </div>
  );
}

export default PaymentStep;