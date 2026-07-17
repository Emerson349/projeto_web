import ProductCard from '@/components/ProductCard';

export default function ProductList({ products, adminActions }) {
  if (!products?.length) {
    return <p className="empty-state">Nenhum produto encontrado.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          adminActions={adminActions ? adminActions(product) : null}
        />
      ))}
    </div>
  );
}
