import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { vehicleImageUrl, vehicleImageCount } from '../utils/vehicleImage.js';
import '../styles/Payment.css';

const paymentMethods = [
  { key: 'card', label: 'Credit / Debit Card', note: 'Visa, Mastercard, RuPay' },
  { key: 'upi', label: 'UPI', note: 'Pay via Google Pay, PhonePe, Paytm etc.' },
  { key: 'netbanking', label: 'Net Banking', note: 'All major banks supported' },
  { key: 'wallet', label: 'Wallet', note: 'Paytm, Amazon Pay, Mobikwik etc.' },
  { key: 'cod', label: 'Cash on Delivery', note: 'Pay when you receive the vehicle' },
];

function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!state || !state.vehicle) {
    return (
      <div className="container">
        <p>No booking details found. Please start a booking from the vehicles page.</p>
      </div>
    );
  }

  const { vehicle, pickupLocation, pickupDate, dropoffDate, addOns, totalAmount } = state;

  const handlePay = async (e) => {
    e.preventDefault();

    if (selectedMethod === 'card' && (!cardNumber || !expiry || !cvv || !cardName)) {
      alert('Please fill in all card details');
      return;
    }

    try {
      setSubmitting(true);
      // no need to send who's booking - the backend reads that from the login token
      const res = await api.post('/bookings', {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehicleType: vehicle.type,
        pickupLocation,
        pickupDate,
        dropoffDate,
        addOns,
        totalAmount,
      });

      navigate('/booking-confirmation', {
        state: {
          bookingId: res.data.data._id,
          vehicleName: vehicle.name,
          pickupLocation,
          pickupDate,
          dropoffDate,
          totalAmount,
        },
      });
    } catch (err) {
      alert('Something went wrong while confirming your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="payment-page container">
      <button className="back-link" onClick={() => navigate(-1)}>
        ← Back to Booking
      </button>
      <h1>🛡️ Proceed to Pay</h1>
      <p className="payment-subtitle">Choose your preferred payment method and complete your booking.</p>

      <div className="payment-layout">
        <div className="card payment-block">
          <h3>Booking Summary</h3>
          <div className="summary-vehicle">
            {vehicleImageCount(vehicle) > 0 ? (
              <img src={vehicleImageUrl(vehicle)} alt={vehicle.name} />
            ) : (
              <div className="payment-vehicle-placeholder">📷</div>
            )}
            <div>
              <h4>{vehicle.name}</h4>
              <p>{vehicle.fuel} | {vehicle.transmission}</p>
              <span className="vehicle-rating">★ {vehicle.rating}</span>
            </div>
          </div>
          <div className="summary-row"><span>Pickup Date</span><span>{pickupDate}</span></div>
          <div className="summary-row"><span>Drop-off Date</span><span>{dropoffDate}</span></div>
          <div className="summary-row"><span>Pickup Location</span><span>{pickupLocation}</span></div>
          <div className="summary-row summary-total"><span>Total Amount</span><span>₹{totalAmount}</span></div>
        </div>

        <div className="card payment-block">
          <h3>Payment Method</h3>
          <p className="payment-hint">Select your preferred payment method</p>

          {paymentMethods.map((method) => (
            <label
              key={method.key}
              className={`payment-method-row ${selectedMethod === method.key ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={selectedMethod === method.key}
                onChange={() => setSelectedMethod(method.key)}
              />
              <div>
                <strong>{method.label}</strong>
                <span>{method.note}</span>
              </div>
            </label>
          ))}

          <div className="secure-note">🔒 100% Secure Payments — your information is safe and encrypted.</div>
        </div>

        <div className="card payment-block">
          <h3>Card Details</h3>
          <form onSubmit={handlePay}>
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                disabled={selectedMethod !== 'card'}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  disabled={selectedMethod !== 'card'}
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  disabled={selectedMethod !== 'card'}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                placeholder="Enter name as on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                disabled={selectedMethod !== 'card'}
              />
            </div>

            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Processing...' : `🔒 Pay ₹${totalAmount}`}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Payment;
