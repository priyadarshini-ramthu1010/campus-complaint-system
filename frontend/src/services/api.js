import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
        // Let application react toauth removal, page reload handles redirect if protected
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
