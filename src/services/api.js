import axios from 'axios';

// Base URL untuk API
const API_BASE_URL = 'http://localhost:8000/api';

// Buat instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau tidak valid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  refresh: () => api.post('/refresh'),
  me: () => api.get('/me'),
};

// Absensi API
export const absensiAPI = {
  absen: (data) => api.post('/absensi', data),
  absenPulang: (data) => api.post('/absensi/pulang', data),
  riwayat: () => api.get('/absensi/riwayat'),
};

// Admin API
export const adminAPI = {
  rekap: () => api.get('/admin/rekap'),
};

// Guru API
export const guruAPI = {
  laporan: () => api.get('/guru/laporan'),
};

export default api;

