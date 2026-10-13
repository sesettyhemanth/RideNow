// SAVE THIS AS: client/src/api.js
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

  // If we are anywhere inside the /admin section, ALWAYS prioritize the admin token
  const isAdminContext = window.location.pathname.startsWith('/admin');
  const activeToken = isAdminContext 
    ? (adminData?.token || userData?.token) 
    : (userData?.token || adminData?.token);

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