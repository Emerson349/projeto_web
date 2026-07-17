'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductForm from '@/components/ProductForm';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function NewProductPage() {
  const router = useRouter();
  const { adminPassword, isAuthenticated } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function loadOptions() {
      const [categoriesResponse, tagsResponse] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tags')
      ]);

      if (!categoriesResponse.ok || !tagsResponse.ok) {
        setLoadError('Não foi possível carregar categorias e tags.');
        return;
      }

      const categoriesData = await categoriesResponse.json();
      const tagsData = await tagsResponse.json();
      setCategories(categoriesData.categories);
      setTags(tagsData.tags);
    }

    loadOptions();
  }, [isAuthenticated]);

  async function createProduct(payload) {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Não foi possível criar o produto.');
    }

    router.push('/admin/produtos');
  }

  return (
    <div>
      <div className="admin-heading">
        <div>
          <h1>Novo produto</h1>
          <p>Cadastre um livro físico ou e-book.</p>
        </div>
      </div>
      {loadError ? (
        <p className="error-message">{loadError}</p>
      ) : (
        <ProductForm
          categories={categories}
          tags={tags}
          onSubmit={createProduct}
          submitLabel="Criar produto"
        />
      )}
    </div>
  );
}
