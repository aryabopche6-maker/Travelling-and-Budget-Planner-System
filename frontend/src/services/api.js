import axios from 'axios';

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL 
  || (import.meta.env.PROD 
      ? 'https://travelling-and-budget-planner-system.onrender.com/api' 
      : 'http://localhost:8081/api');

const api = axios.create({
  baseURL: defaultBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    // Handle unauthorized (e.g., clear token, redirect to login)
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    window.dispatchEvent(new Event('unauthorized'));
  }
  return Promise.reject(error);
});

export default api;
