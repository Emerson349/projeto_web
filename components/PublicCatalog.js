'use client';

import { useMemo, useState } from 'react';
import CategoryFilter from '@/components/CategoryFilter';
import ProductList from '@/components/ProductList';
import SearchBar from '@/components/SearchBar';

export default function PublicCatalog({ products, categories }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [format, setFormat] = useState('');

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        [product.title, product.author, product.description]
          .join(' ')
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        !category || product.categories?.some((item) => item.slug === category);

      const matchesFormat = !format || product.format === format;

      return matchesSearch && matchesCategory && matchesFormat;
    });
  }, [products, search, category, format]);

  return (
    <div className="catalog-layout">
      <aside className="catalog-filters">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter categories={categories} value={category} onChange={setCategory} />
        <label className="category-filter">
          <span>Formato</span>
          <select value={format} onChange={(event) => setFormat(event.target.value)}>
            <option value="">Todos</option>
            <option value="fisico">Livro físico</option>
            <option value="ebook">E-book</option>
          </select>
        </label>
      </aside>
      <section aria-label="Lista de produtos">
        <ProductList products={filteredProducts} />
      </section>
    </div>
  );
}
