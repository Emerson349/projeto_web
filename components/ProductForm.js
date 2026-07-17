'use client';

import { useMemo, useState } from 'react';

const emptyProduct = {
  title: '',
  slug: '',
  author: '',
  description: '',
  format: 'fisico',
  price: '',
  cover_url: '',
  isbn: '',
  publication_year: '',
  pages: '',
  is_featured: false,
  category_ids: [],
  tag_ids: []
};

function getInitialProduct(product) {
  if (!product) {
    return emptyProduct;
  }

  return {
    ...emptyProduct,
    ...product,
    price: String(product.price ?? ''),
    publication_year: product.publication_year ? String(product.publication_year) : '',
    pages: product.pages ? String(product.pages) : '',
    category_ids: product.categories?.map((category) => String(category.id)) || [],
    tag_ids: product.tags?.map((tag) => String(tag.id)) || []
  };
}

export default function ProductForm({ product, categories, tags, onSubmit, submitLabel }) {
  const initialProduct = useMemo(() => getInitialProduct(product), [product]);
  const [form, setForm] = useState(initialProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleArrayValue(name, value) {
    setForm((current) => {
      const values = current[name].includes(value)
        ? current[name].filter((item) => item !== value)
        : [...current[name], value];

      return { ...current, [name]: values };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      ...form,
      price: Number(form.price || 0),
      publication_year: form.publication_year ? Number(form.publication_year) : null,
      pages: form.pages ? Number(form.pages) : null,
      category_ids: form.category_ids.map(Number),
      tag_ids: form.tag_ids.map(Number)
    };

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError.message || 'Não foi possível salvar o produto.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid product-form" onSubmit={handleSubmit}>
      {error ? <p className="error-message">{error}</p> : null}

      <div className="form-row">
        <label htmlFor="title">Título</label>
        <input
          id="title"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          value={form.slug}
          onChange={(event) => updateField('slug', event.target.value)}
          placeholder="gerado pelo título se ficar vazio"
        />
      </div>

      <div className="form-row">
        <label htmlFor="author">Autor</label>
        <input
          id="author"
          value={form.author}
          onChange={(event) => updateField('author', event.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="description">Descrição</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          required
        />
      </div>

      <div className="form-columns">
        <div className="form-row">
          <label htmlFor="format">Formato</label>
          <select
            id="format"
            value={form.format}
            onChange={(event) => updateField('format', event.target.value)}
          >
            <option value="fisico">Livro físico</option>
            <option value="ebook">E-book</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="price">Preço</label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => updateField('price', event.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="cover_url">URL da capa</label>
        <input
          id="cover_url"
          type="url"
          value={form.cover_url || ''}
          onChange={(event) => updateField('cover_url', event.target.value)}
        />
      </div>

      <div className="form-columns">
        <div className="form-row">
          <label htmlFor="isbn">ISBN</label>
          <input
            id="isbn"
            value={form.isbn || ''}
            onChange={(event) => updateField('isbn', event.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="publication_year">Ano</label>
          <input
            id="publication_year"
            type="number"
            min="1900"
            max="2155"
            value={form.publication_year || ''}
            onChange={(event) => updateField('publication_year', event.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="pages">Páginas</label>
          <input
            id="pages"
            type="number"
            min="1"
            value={form.pages || ''}
            onChange={(event) => updateField('pages', event.target.value)}
          />
        </div>
      </div>

      <fieldset className="checkbox-group">
        <legend>Categorias</legend>
        {categories.map((category) => (
          <label key={category.id}>
            <input
              type="checkbox"
              checked={form.category_ids.includes(String(category.id))}
              onChange={() => toggleArrayValue('category_ids', String(category.id))}
            />
            {category.name}
          </label>
        ))}
      </fieldset>

      <fieldset className="checkbox-group">
        <legend>Tags</legend>
        {tags.map((tag) => (
          <label key={tag.id}>
            <input
              type="checkbox"
              checked={form.tag_ids.includes(String(tag.id))}
              onChange={() => toggleArrayValue('tag_ids', String(tag.id))}
            />
            {tag.name}
          </label>
        ))}
      </fieldset>

      <label className="inline-checkbox">
        <input
          type="checkbox"
          checked={form.is_featured}
          onChange={(event) => updateField('is_featured', event.target.checked)}
        />
        Exibir como destaque
      </label>

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : submitLabel}
      </button>
    </form>
  );
}
