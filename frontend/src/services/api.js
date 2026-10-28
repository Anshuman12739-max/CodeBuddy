import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 65000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codebuddy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to normalize error responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const responseData = error.response?.data;
    const message = responseData?.error?.message || responseData?.message || error.message || 'Network request failed';
    const err = new Error(message);
    err.code = responseData?.error?.code || 'UNKNOWN_ERROR';
    err.details = responseData?.error?.details || [];
    err.status = error.response?.status;
    return Promise.reject(err);
  }
);

export default api;
