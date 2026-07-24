import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const getMediaUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${base}/media${cleanPath.startsWith('/complaints/') ? '' : ''}${cleanPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle API errors globally
api.interceptors.response.use(
  (response) => {
    // Return the custom unified response structure: { success, message, data }
    return response.data;
  },
  (error) => {
    let message = 'An unexpected error occurred';
    let errors = {};

    if (error.response) {
      const data = error.response.data;
      message = data.message || error.response.statusText;
      errors = data.errors || {};

      // If token expired / unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Let application react to auth removal
      }
    } else if (error.request) {
      message = 'Cannot connect to server. Please check if backend is running.';
    }

    return Promise.reject({
      success: false,
      message,
      errors,
    });
  }
);

export default api;

