import axios from 'axios';

// Ensure the base URL always includes /api whether provided in env or defaulting to localhost
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

// Central axios instance, so every page hits the correct backend url with /api
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const admin = JSON.parse(localStorage.getItem('ridenow_admin') || 'null');
  const user = JSON.parse(localStorage.getItem('ridenow_user') || 'null');
  const token = admin?.token || user?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const serverURL = API_URL.replace(/\/api\/?$/, '');

export default api;