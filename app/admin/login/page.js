'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError('Senha inválida.');
      return;
    }

    login(password);
    router.replace('/admin/produtos');
  }

  return (
    <div className="admin-login">
      <div className="page-header">
        <h1 className="page-title">Login administrativo</h1>
        <p className="page-description">Acesse o painel de catálogo da COMPIA Editora.</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        {error ? <p className="error-message">{error}</p> : null}
        <div className="form-row">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
