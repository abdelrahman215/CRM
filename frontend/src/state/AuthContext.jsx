import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('avenue_crm_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setAccessToken(parsed.accessToken);
    }
  }, []);

  useEffect(() => {
    if (user && accessToken) {
      localStorage.setItem('avenue_crm_auth', JSON.stringify({ user, accessToken }));
    } else {
      localStorage.removeItem('avenue_crm_auth');
    }
  }, [user, accessToken]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      setAccessToken(res.data.accessToken);
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    setUser(null);
    setAccessToken(null);
    navigate('/login');
  };

  const value = {
    user,
    accessToken,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

