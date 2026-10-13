// SAVE THIS AS: client/src/context/AppContext.jsx  (replace the old file)
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

function readSaved(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function persist(key, value) {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {
    // storage full or blocked - the session still works, it just won't survive a refresh
  }
}

export function AppProvider({ children }) {
  // load whatever was saved last time, so a page refresh doesn't log people out
  const [user, setUser] = useState(() => readSaved('ridenow_user'));
  const [admin, setAdmin] = useState(() => readSaved('ridenow_admin'));

  // keeps storage in step with later changes (profile edits and so on)
  useEffect(() => persist('ridenow_user', user), [user]);
  useEffect(() => persist('ridenow_admin', admin), [admin]);

  // login / logout also save RIGHT AWAY. If we waited for the effects above, the page
  // we navigate to could send its first request before the token was in storage,
  // and that request would fail with 401 and bounce the person back to /login.
  const loginUser = (userData, token) => {
    const next = { ...userData, token };
    persist('ridenow_user', next);
    setUser(next);
  };
  const logoutUser = () => {
    persist('ridenow_user', null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...userData, token: prev?.token }));
  };

  const loginAdmin = (adminData, token) => {
    const next = { ...adminData, token };
    persist('ridenow_admin', next);
    setAdmin(next);
  };
  const logoutAdmin = () => {
    persist('ridenow_admin', null);
    setAdmin(null);
  };

  const updateAdmin = (adminData, token) => {
    setAdmin((prev) => ({ ...prev, ...adminData, token: token || prev?.token }));
  };

  return (
    <AppContext.Provider
      value={{ user, loginUser, logoutUser, updateUser, admin, loginAdmin, logoutAdmin, updateAdmin }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}