'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isReady, logout } = useAdminAuth();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isReady && !isAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoginPage, isReady, router]);

  if (!isReady) {
    return <p className="container page-section">Carregando...</p>;
  }

  if (!isAuthenticated && !isLoginPage) {
    return <p className="container page-section">Redirecionando...</p>;
  }

  return (
    <section className="page-section">
      <div className="container admin-shell">
        {!isLoginPage ? (
          <aside className="admin-sidebar">
            <h1>Admin</h1>
            <nav>
              <Link href="/admin/produtos">Produtos</Link>
              <Link href="/admin/produtos/novo">Novo produto</Link>
            </nav>
            <button className="button secondary" type="button" onClick={logout}>
              Sair
            </button>
          </aside>
        ) : null}
        <div className="admin-content">{children}</div>
      </div>
    </section>
  );
}
