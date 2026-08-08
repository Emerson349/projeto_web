'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithCredentials, login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (email.trim()) {
        await loginWithCredentials(email, password);
      } else {
        await login(password);
      }
      router.push('/admin/produtos');
    } catch (err) {
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillDemoAccount(demoEmail) {
    setEmail(demoEmail);
    setPassword('aluno001');
  }

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
          Painel Administrativo
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#475569', margin: 0 }}>
          Controle de Acesso por Perfis
        </p>
      </div>

      <div
        style={{
          background: '#ffffff',
          padding: '28px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)'
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          {error ? (
            <div
              style={{
                color: '#b91c1c',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {error}
            </div>
          ) : null}

          <div style={{ display: 'grid', gap: '6px' }}>
            <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1e293b' }}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu.email@compia.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gap: '6px' }}>
            <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1e293b' }}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#0d9488',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <hr style={{ margin: '24px 0 20px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '12px', fontWeight: '500' }}>
            Contas de teste (Senha: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>aluno001</code>):
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@compia.com.br')}
              style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('editor@compia.com.br')}
              style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('vendedor@compia.com.br')}
              style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Vendedor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
