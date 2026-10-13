// SAVE THIS AS: client/src/api.js  (replace the old file)
import axios from 'axios';

// Ensure the base URL always includes /api whether provided in env or defaulting to localhost
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

// Central axios instance, so every page hits the correct backend url with /api
const api = axios.create({
  baseURL: API_URL,
});

function readSaved(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

// Admin pages live under /admin and must use the admin login.
// Every other page must use the normal user login.
function isAdminPage() {
  return window.location.pathname.startsWith('/admin');
}

api.interceptors.request.use((config) => {
  const saved = isAdminPage() ? readSaved('ridenow_admin') : readSaved('ridenow_user');

  if (saved?.token) {
    config.headers.Authorization = `Bearer ${saved.token}`;
  }

  return config;
});

// Safe response interceptor that passes errors through without force-reloading the page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const serverURL = API_URL.replace(/\/api\/?$/, '');

export default api;