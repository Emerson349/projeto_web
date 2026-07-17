'use client';

export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <label className="category-filter">
      <span>Categoria</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todas</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}
