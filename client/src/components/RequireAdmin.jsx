import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

// wraps a page and sends visitors to the login page if they aren't logged in as admin
function RequireAdmin({ children }) {
  const { admin } = useApp();

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RequireAdmin;
