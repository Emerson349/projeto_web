'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AdminAuthContext = createContext(null);
const STORAGE_KEY = 'compia_admin_password';

export function AdminAuthProvider({ children }) {
  const [adminPassword, setAdminPassword] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAdminPassword(window.localStorage.getItem(STORAGE_KEY) || '');
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function login(password) {
    window.localStorage.setItem(STORAGE_KEY, password);
    setAdminPassword(password);
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setAdminPassword('');
  }

  const value = useMemo(
    () => ({
      adminPassword,
      isAuthenticated: Boolean(adminPassword),
      isReady,
      login,
      logout
    }),
    [adminPassword, isReady]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider.');
  }

  return context;
}
