// src/services/authService.js
import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('auth_token', response.data.data.token);
      return response.data.data;
    }
    throw new Error(response.data?.message || "Invalid credentials");
  },

  signup: async (name, email, password, phone = "") => {
    const response = await api.post('/auth/signup', { name, email, password, confirmPassword: password, phone });
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('auth_token', response.data.data.token);
      return response.data.data;
    }
    throw new Error(response.data?.message || "Registration failed");
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!token) return null;
    try {
      const response = await api.get('/users/me');
      return response.data?.data || null;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        return null;
      }
      throw error;
    }
  }
};
