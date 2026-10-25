'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user && res.user.role === 'admin') {
        setAdminUser(res.user);
      } else {
        setAdminUser(null);
      }
    } catch (err) {
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminUser();
  }, [fetchAdminUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/admin-login', { email, password });
    if (res.success && res.user) {
      if (res.token) {
        localStorage.setItem('reserveease_admin_token', res.token);
      }
      setAdminUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Admin login failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      localStorage.removeItem('reserveease_admin_token');
      setAdminUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, login, logout, fetchAdminUser }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
