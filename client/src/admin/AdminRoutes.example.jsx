import React from 'react';
import { Route } from 'react-router-dom';

import AdminLayout from './components/AdminLayout.jsx';
import AdminOverview from './pages/AdminOverview.jsx';
import AdminVehicles from './pages/AdminVehicles.jsx';
import AdminBookings from './pages/AdminBookings.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminPayments from './pages/AdminPayments.jsx';
import AdminReports from './pages/AdminReports.jsx';
import AdminSettings from './pages/AdminSettings.jsx';
import AdminNotifications from './pages/AdminNotifications.jsx';
import AdminHelp from './pages/AdminHelp.jsx';
import VerifyBooking from './pages/VerifyBooking.jsx';

export const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminOverview />} />
    <Route path="vehicles" element={<AdminVehicles />} />
    <Route path="bookings" element={<AdminBookings />} />
    <Route path="users" element={<AdminUsers />} />
    <Route path="payments" element={<AdminPayments />} />
    <Route path="reports" element={<AdminReports />} />
    <Route path="settings" element={<AdminSettings />} />
    <Route path="notifications" element={<AdminNotifications />} />
    <Route path="help" element={<AdminHelp />} />
    <Route path="verify/:bookingId" element={<VerifyBooking />} />
  </Route>
);