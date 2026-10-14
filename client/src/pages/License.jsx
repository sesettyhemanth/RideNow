import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import LicenseSection from '../components/LicenseSection.jsx';
import '../styles/License.css';
import '../styles/BookingSteps.css';
import '../styles/Mobile.css';

function License() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/vehicles';

  if (!user) {
    const licensePath = `/license?redirect=${encodeURIComponent(redirectTo)}`;
    return (
      <section className="license-page container">
        <p>
          Please <Link to={`/login?redirect=${encodeURIComponent(licensePath)}`}>login</Link> first
          to submit your driving license.
        </p>
      </section>
    );
  }

  const status = user.licenseStatus || 'not_submitted';
  const canContinue = status === 'pending' || status === 'verified';

  return (
    <section className="license-page container">
      <h1>Driving License</h1>
      <p className="license-subtitle">
        Submit your license once. Our team verifies it — until then it shows as Pending, and you can
        already book a vehicle (the booking is confirmed after verification).
      </p>

      <LicenseSection />

      {canContinue && (
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(redirectTo)}>
          Continue to Booking →
        </button>
      )}
    </section>
  );
}

export default License;