// SAVE THIS AS: client/src/api.js  (replace the old file)
import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

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

api.interceptors.request.use((config) => {
  const adminData = readSaved('ridenow_admin');
  const userData = readSaved('ridenow_user');

  // Inside /admin ONLY the admin token is used. Falling back to a normal user's token there
  // just produces confusing "account not found" / "admin access required" errors.
  const isAdminContext = window.location.pathname.startsWith('/admin');
  const activeToken = isAdminContext ? adminData?.token : userData?.token;

  if (activeToken) {
    config.headers.Authorization = `Bearer ${activeToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const serverURL = API_URL.replace(/\/api\/?$/, '');

export default api;