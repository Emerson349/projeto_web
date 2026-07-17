'use client';

export default function SearchBar({ value, onChange }) {
  return (
    <label className="search-bar">
      <span>Buscar</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Título, autor ou tema"
      />
    </label>
  );
}
