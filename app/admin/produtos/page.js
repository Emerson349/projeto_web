'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProductList from '@/components/ProductList';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminProductsPage() {
  const { adminPassword, isAuthenticated } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function loadProducts() {
      setIsLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Não foi possível carregar os produtos.');
      } else {
        setProducts(data.products);
      }

      setIsLoading(false);
    }

    loadProducts();
  }, [isAuthenticated]);

  async function handleDelete(productId) {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'x-admin-password': adminPassword
      }
    });

    if (!response.ok) {
      setError('Não foi possível excluir o produto.');
      return;
    }

    setProducts((current) => current.filter((product) => product.id !== productId));
  }

  return (
    <div>
      <div className="admin-heading">
        <div>
          <h1>Produtos</h1>
          <p>Gerencie o catálogo público da loja.</p>
        </div>
        <Link className="button" href="/admin/produtos/novo">Novo produto</Link>
      </div>

      {error ? <p className="error-message">{error}</p> : null}
      {isLoading ? (
        <p>Carregando produtos...</p>
      ) : (
        <ProductList
          products={products}
          adminActions={(product) => (
            <div className="admin-card-actions">
              <Link className="button secondary" href={`/admin/produtos/${product.id}/editar`}>
                Editar
              </Link>
              <button className="button danger" type="button" onClick={() => handleDelete(product.id)}>
                Excluir
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
