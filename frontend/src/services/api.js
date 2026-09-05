import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://e-booknest-production.up.railway.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`
});

// Attach the JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ebooknest_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralize 401 handling — bounce to login if the session has expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ebooknest_token');
      localStorage.removeItem('ebooknest_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const fileUrl = (path) => (path ? `${API_BASE_URL}${path}` : null);

export default api;
