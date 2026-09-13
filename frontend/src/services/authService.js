// src/services/authService.js

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock User Database
const mockUser = {
  id: '1',
  name: 'Alex Traveler',
  email: 'alex@example.com',
  token: 'mock-jwt-token-12345'
};

export const authService = {
  login: async (email, password) => {
    await delay(1000);
    if (email && password) {
      localStorage.setItem('auth_token', mockUser.token);
      return mockUser;
    }
    throw new Error("Invalid credentials");
  },

  signup: async (name, email, password) => {
    await delay(1000);
    if (name && email && password) {
      localStorage.setItem('auth_token', mockUser.token);
      return { ...mockUser, name, email };
    }
    throw new Error("Invalid data");
  },

  logout: async () => {
    await delay(300);
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async () => {
    await delay(500);
    const token = localStorage.getItem('auth_token');
    if (token) {
      return mockUser;
    }
    return null;
  }
};
