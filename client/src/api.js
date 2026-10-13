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

// Check if we are on an admin page or hitting an admin endpoint
function isEligibleForAdminToken(configUrl = '') {
  const isPathAdmin = window.location.pathname.startsWith('/admin');
  const isUrlAdmin = configUrl.includes('/admin');
  return isPathAdmin || isUrlAdmin;
}

api.interceptors.request.use((config) => {
  const adminData = readSaved('ridenow_admin');
  const userData = readSaved('ridenow_user');

  // Prioritize admin token if this is an admin context, otherwise fall back to user token
  const shouldUseAdmin = isEligibleForAdminToken(config.url);
  const activeToken = shouldUseAdmin 
    ? (adminData?.token || userData?.token) 
    : (userData?.token || adminData?.token);

  if (activeToken) {
    config.headers.Authorization = `Bearer ${activeToken}`;
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