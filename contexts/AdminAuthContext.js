'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isReady, setIsReady] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  async function loginWithCredentials(email, password) {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.message || 'Falha ao realizar login. Verifique suas credenciais.');
    }

    setUser(data.user);
    return data.user;
  }

  // Compatibilidade com login legado
  async function login(password) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.message || 'Senha administrativa inválida.');
    }

    setAdminPassword(password);
    if (data.user) {
      setUser(data.user);
    } else {
      setUser({ id: 1, name: 'Administrador', email: 'admin@compia.com.br', role: 'admin' });
    }
  }

  async function logout() {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (_) {}
    setAdminPassword('');
    setUser(null);
  }

  const role = user?.role || (adminPassword ? 'admin' : null);

  const value = useMemo(
    () => ({
      user,
      role,
      adminPassword,
      isAuthenticated: Boolean(user || adminPassword),
      isReady,
      loginWithCredentials,
      login,
      logout,
      refreshSession: fetchSession,
      hasRole: (allowedRoles) => {
        if (!allowedRoles || allowedRoles.length === 0) return true;
        if (!role) return false;
        return allowedRoles.includes(role);
      }
    }),
    [user, role, adminPassword, isReady, fetchSession]
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
