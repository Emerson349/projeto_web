'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const ROLE_LABELS = {
  admin: { label: 'Administrador', badgeClass: 'badge-admin', color: '#8b5cf6' },
  editor: { label: 'Editor', badgeClass: 'badge-editor', color: '#3b82f6' },
  vendedor: { label: 'Vendedor', badgeClass: 'badge-vendedor', color: '#10b981' }
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isReady, logout, user, role, hasRole } = useAdminAuth();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isReady && !isAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoginPage, isReady, router]);

  if (!isReady) {
    return <p className="container page-section">Carregando permissões...</p>;
  }

  if (!isAuthenticated && !isLoginPage) {
    return <p className="container page-section">Redirecionando...</p>;
  }

  const roleInfo = ROLE_LABELS[role] || { label: role || 'Usuário', color: '#94a3b8' };

  return (
    <section className="page-section">
      <div className="container admin-shell">
        {!isLoginPage ? (
          <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h1 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Painel COMPIA</h1>
              {user ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>{user.email}</div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '0.4rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      backgroundColor: `${roleInfo.color}18`,
                      color: roleInfo.color,
                      border: `1px solid ${roleInfo.color}44`
                    }}
                  >
                    {roleInfo.label}
                  </span>
                </div>
              ) : null}
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                href="/admin/produtos"
                className={pathname.startsWith('/admin/produtos') && !pathname.includes('/novo') ? 'active' : ''}
              >
                Produtos
              </Link>

              {hasRole(['admin', 'editor']) ? (
                <Link
                  href="/admin/produtos/novo"
                  className={pathname === '/admin/produtos/novo' ? 'active' : ''}
                >
                  Novo produto
                </Link>
              ) : null}

              <Link
                href="/admin/pedidos"
                className={pathname.startsWith('/admin/pedidos') ? 'active' : ''}
              >
                Pedidos
              </Link>

              {hasRole(['admin']) ? (
                <Link
                  href="/admin/usuarios"
                  className={pathname.startsWith('/admin/usuarios') ? 'active' : ''}
                >
                  Gerenciar Equipe
                </Link>
              ) : null}
            </nav>

            <div style={{ marginTop: 'auto' }}>
              <button
                className="button secondary"
                type="button"
                onClick={logout}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                Sair do sistema
              </button>
            </div>
          </aside>
        ) : null}
        <div className="admin-content">{children}</div>
      </div>
    </section>
  );
}
