import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import api from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import BookingStepper from '../components/booking/BookingStepper.jsx';
import BookingDetailsStep from '../components/booking/BookingDetailsStep.jsx';
import PaymentStep from '../components/booking/PaymentStep.jsx';
import DocumentationStep from '../components/booking/DocumentationStep.jsx';
import ConfirmationStep from '../components/booking/ConfirmationStep.jsx';
import { PICKUP_LOCATIONS } from '../utils/bookingValidation.js';
import { calculatePricing } from '../utils/bookingPricing.js';
import '../styles/Booking.css';
import '../styles/BookingWizard.css';
import '../styles/BookingSteps.css';

const STEP = { DETAILS: 1, PAYMENT: 2, DOCUMENTATION: 3, CONFIRMATION: 4 };

const INITIAL_DETAILS = {
  pickupLocation: PICKUP_LOCATIONS[0],
  pickupDate: '',
  dropoffDate: '',
  pickupTime: '10:00 AM',
  dropoffTime: '10:00 AM',
  addOns: ['helmet'],
};

const INITIAL_PAYMENT = { method: 'upi', upiId: '', cardNumber: '', expiry: '', cvv: '', cardName: '' };

function Booking() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();

  const [step, setStep] = useState(STEP.DETAILS);
  const [vehicle, setVehicle] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [details, setDetails] = useState(INITIAL_DETAILS);
  const [payment, setPayment] = useState(INITIAL_PAYMENT);
  const [paid, setPaid] = useState(false); // so going Back from step 3 doesn't undo the payment

  const [booking, setBooking] = useState(null); // set once the booking is saved
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const confirmingRef = useRef(false); // synchronous guard - state updates are async

  /* ---------- data loading ---------- */

  useEffect(() => {
    let ignore = false; // protects against setting state after unmount / param change
    setVehicle(null);
    setLoadError('');

    api
      .get(`/vehicles/${type}/${id}`)
      .then((res) => {
        if (!ignore) setVehicle(res.data.data);
      })
      .catch((err) => {
        if (!ignore) {
          setLoadError(err.response?.data?.message || 'We couldn’t load this vehicle. Please try again.');
        }
      });

    return () => {
      ignore = true;
    };
  }, [type, id]);

  // warn before a refresh/close would throw away a half-finished booking
  useEffect(() => {
    if (step !== STEP.PAYMENT && step !== STEP.DOCUMENTATION) return undefined;

    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [step]);

  /* ---------- derived values & helpers ---------- */

  const pricing = useMemo(() => calculatePricing(vehicle, details), [vehicle, details]);

  const goToStep = useCallback((nextStep) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const updateDetails = useCallback((patch) => {
    setDetails((prev) => ({ ...prev, ...patch }));
    setPaid(false); // dates / add-ons changed, so the amount may have changed too
  }, []);

  const updatePayment = useCallback((patch) => setPayment((prev) => ({ ...prev, ...patch })), []);

  const handlePaid = () => {
    setPayment((prev) => ({ ...INITIAL_PAYMENT, method: prev.method }));
    setPaid(true);
    goToStep(STEP.DOCUMENTATION);
  };

  // the booking is only created here, after details, payment AND license are all done
  const handleConfirm = async () => {
    if (confirmingRef.current) return; // guards against double-clicks creating two bookings
    confirmingRef.current = true;

    try {
      setConfirming(true);
      setConfirmError('');

      const res = await api.post('/bookings', {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehicleType: vehicle.type,
        pickupLocation: details.pickupLocation,
        pickupDate: details.pickupDate,
        dropoffDate: details.dropoffDate,
        pickupTime: details.pickupTime,
        dropoffTime: details.dropoffTime,
        addOns: details.addOns,
        totalAmount: pricing.totalAmount,
        paymentMethod: payment.method,
      });

      setBooking(res.data.data);
      goToStep(STEP.CONFIRMATION);
    } catch (err) {
      setConfirmError(
        err.response?.data?.message || 'Something went wrong while confirming your booking. Please try again.'
      );
    } finally {
      confirmingRef.current = false;
      setConfirming(false);
    }
  };

  /* ---------- early returns (all hooks are above this line) ---------- */

  // not logged in -> straight to login, then back here
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(`/booking/${type}/${id}`)}`} replace />;
  }

  if (loadError) {
    return (
      <section className="booking-page">
        <div className="container">
          <p className="error-text" role="alert">
            {loadError}
          </p>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>
      </section>
    );
  }

  if (!vehicle) return <p className="container">Loading...</p>;

  /* ---------- render ---------- */

  return (
    <section className="booking-page">
      <div className="container">
        {/* once the booking exists, every step (including the last) shows as done */}
        <BookingStepper currentStep={booking ? STEP.CONFIRMATION + 1 : step} />

        {step === STEP.DETAILS && (
          <BookingDetailsStep
            vehicle={vehicle}
            details={details}
            onChange={updateDetails}
            pricing={pricing}
            onNext={() => goToStep(STEP.PAYMENT)}
            onCancel={() => navigate(-1)}
          />
        )}

        {step === STEP.PAYMENT && (
          <PaymentStep
            vehicle={vehicle}
            details={details}
            pricing={pricing}
            payment={payment}
            paid={paid}
            onChange={updatePayment}
            onPaid={handlePaid}
            onContinue={() => goToStep(STEP.DOCUMENTATION)}
            onBack={() => goToStep(STEP.DETAILS)}
          />
        )}

        {step === STEP.DOCUMENTATION && (
          <DocumentationStep
            vehicleType={vehicle.type}
            onBack={() => goToStep(STEP.PAYMENT)}
            onConfirm={handleConfirm}
            confirming={confirming}
            confirmError={confirmError}
          />
        )}

        {step === STEP.CONFIRMATION && booking && <ConfirmationStep booking={booking} />}
      </div>
    </section>
  );
}

export default Booking;