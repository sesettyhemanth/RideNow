import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// central axios instance, so every page hits the same backend url
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
