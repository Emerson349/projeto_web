import Link from 'next/link';
import Image from 'next/image';

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

export default function ProductCard({ product, adminActions }) {
  return (
    <article className="product-card">
      <Link href={`/produtos/${product.slug}`} className="product-cover" aria-label={product.title}>
        {product.cover_url ? (
          <Image src={product.cover_url} alt="" width={360} height={520} unoptimized />
        ) : (
          <span>{product.format === 'ebook' ? 'E-book' : 'Livro'}</span>
        )}
      </Link>
      <div className="product-card-body">
        <div className="product-meta">
          <span>{product.format === 'ebook' ? 'E-book' : 'Físico'}</span>
          {product.categories?.[0] ? <span>{product.categories[0].name}</span> : null}
        </div>
        <h2>
          <Link href={`/produtos/${product.slug}`}>{product.title}</Link>
        </h2>
        <p className="product-author">{product.author}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-card-footer">
          <strong>{formatPrice(product.price)}</strong>
          {adminActions || <Link className="button secondary" href={`/produtos/${product.slug}`}>Ver detalhes</Link>}
        </div>
      </div>
    </article>
  );
}
