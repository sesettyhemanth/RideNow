import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';
import ActiveBookingGuard from './components/ActiveBookingGuard.jsx';

import Home from './pages/Home.jsx';
import Vehicles from './pages/Vehicles.jsx';
import VehicleDetails from './pages/VehicleDetails.jsx';
import Booking from './pages/Booking.jsx';
import Payment from './pages/Payment.jsx';
import BookingConfirmation from './pages/BookingConfirmation.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Auth from './pages/Auth.jsx';
import License from './pages/License.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLayout from './admin/pages/AdminLayout.jsx';
import AdminOverview from './admin/pages/AdminOverview.jsx';
import AdminUsers from './admin/pages/AdminUsers.jsx';
import AdminVehicles from './admin/pages/AdminVehicles.jsx';
import AdminBookings from './admin/pages/AdminBookings.jsx';
import AdminPayments from './admin/pages/AdminPayments.jsx';
import AdminReports from './admin/pages/AdminReports.jsx';
import AdminSettings from './admin/pages/AdminSettings.jsx';
import AdminHelp from './admin/pages/AdminHelp.jsx';
import AdminNotifications from './admin/pages/AdminNotifications.jsx';
import VerifyBooking from './admin/pages/VerifyBooking.jsx';

// pages that render full-screen, without the site header and footer
const AUTH_PATHS = ['/login', '/signup'];

function App() {
  const { pathname } = useLocation();
  const hideChrome = AUTH_PATHS.includes(pathname);

  return (
    <>
      {!hideChrome && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:type/:id" element={<VehicleDetails />} />
        <Route
          path="/booking/:type/:id"
          element={
            <ActiveBookingGuard>
              <Booking />
            </ActiveBookingGuard>
          }
        />
        <Route path="/payment" element={<Payment />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* login and signup share one page; the left panel stays the same,
            only the form on the right changes */}
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />

        <Route path="/license" element={<License />} />
        <Route path="/profile" element={<Profile />} />

        {/* every /admin/* route shares one sidebar layout and one login guard */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="help" element={<AdminHelp />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="verify/:bookingId" element={<VerifyBooking />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideChrome && <Footer />}
    </>
  );
}

export default App;