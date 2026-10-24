import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(() => Boolean(
    localStorage.getItem('token') || localStorage.getItem('auth_token')
  ));

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setHasSession(false);
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const user = await authService.login(email, password);
    setUser(user);
    setHasSession(true);
  };

  const signup = async (data) => {
    const user = await authService.signup(data.name, data.email, data.password);
    setUser(user);
    setHasSession(true);
  };

  const logout = async () => {
    await authService.logout();
    window.dispatchEvent(new Event('sos-user-logout'));
    setUser(null);
    setHasSession(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, hasSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
