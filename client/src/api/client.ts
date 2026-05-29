import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7029/api',
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => {
    // Используем encodeURIComponent для правильной кодировки кириллицы
    return Object.keys(params)
      .map(key => {
        const value = params[key];
        if (value === undefined || value === null) return null;
        if (Array.isArray(value)) {
          return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .filter(Boolean)
      .join('&');
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;