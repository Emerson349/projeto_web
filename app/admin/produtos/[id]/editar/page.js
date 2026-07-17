'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductForm from '@/components/ProductForm';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function EditProductPage({ params }) {
  const router = useRouter();
  const { adminPassword, isAuthenticated } = useAdminAuth();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function loadData() {
      setIsLoading(true);
      const [productResponse, categoriesResponse, tagsResponse] = await Promise.all([
        fetch(`/api/products/${params.id}`),
        fetch('/api/categories'),
        fetch('/api/tags')
      ]);

      if (!productResponse.ok || !categoriesResponse.ok || !tagsResponse.ok) {
        setLoadError('Não foi possível carregar o produto.');
        setIsLoading(false);
        return;
      }

      const productData = await productResponse.json();
      const categoriesData = await categoriesResponse.json();
      const tagsData = await tagsResponse.json();
      setProduct(productData.product);
      setCategories(categoriesData.categories);
      setTags(tagsData.tags);
      setIsLoading(false);
    }

    loadData();
  }, [isAuthenticated, params.id]);

  async function updateProduct(payload) {
    const response = await fetch(`/api/products/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Não foi possível atualizar o produto.');
    }

    router.push('/admin/produtos');
  }

  return (
    <div>
      <div className="admin-heading">
        <div>
          <h1>Editar produto</h1>
          <p>Atualize as informações do catálogo.</p>
        </div>
      </div>
      {loadError ? <p className="error-message">{loadError}</p> : null}
      {isLoading ? (
        <p>Carregando produto...</p>
      ) : (
        <ProductForm
          product={product}
          categories={categories}
          tags={tags}
          onSubmit={updateProduct}
          submitLabel="Salvar alterações"
        />
      )}
    </div>
  );
}
