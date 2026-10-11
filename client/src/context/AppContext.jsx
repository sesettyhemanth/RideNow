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

  useEffect(() => persist('ridenow_user', user), [user]);
  useEffect(() => persist('ridenow_admin', admin), [admin]);

  const loginUser = (userData, token) => setUser({ ...userData, token });
  const logoutUser = () => setUser(null);

  const updateUser = (userData) => {
    setUser((prev) => ({ ...userData, token: prev?.token }));
  };

  const loginAdmin = (adminData, token) => setAdmin({ ...adminData, token });
  const logoutAdmin = () => setAdmin(null);

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