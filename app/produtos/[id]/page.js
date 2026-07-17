import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/repositories/productsRepository';

export const dynamic = 'force-dynamic';

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

export default async function ProductDetailPage({ params }) {
  let product;

  try {
    product = await getProductBySlug(params.id);
  } catch (error) {
    product = null;
  }

  if (!product) {
    notFound();
  }

  return (
    <section className="page-section">
      <div className="container product-detail">
        <div className="detail-cover">
          {product.cover_url ? (
            <Image src={product.cover_url} alt="" width={520} height={720} unoptimized />
          ) : (
            <span>{product.title}</span>
          )}
        </div>
        <div className="detail-content">
          <Link href="/produtos" className="back-link">Voltar ao catálogo</Link>
          <p className="eyebrow">{product.format === 'ebook' ? 'E-book' : 'Livro físico'}</p>
          <h1 className="page-title">{product.title}</h1>
          <p className="product-author">Por {product.author}</p>
          <strong className="detail-price">{formatPrice(product.price)}</strong>
          <p>{product.description}</p>

          <dl className="product-specs">
            {product.isbn ? (
              <>
                <dt>ISBN</dt>
                <dd>{product.isbn}</dd>
              </>
            ) : null}
            {product.publication_year ? (
              <>
                <dt>Ano</dt>
                <dd>{product.publication_year}</dd>
              </>
            ) : null}
            {product.pages ? (
              <>
                <dt>Páginas</dt>
                <dd>{product.pages}</dd>
              </>
            ) : null}
          </dl>

          {product.categories?.length ? (
            <div className="tag-row">
              {product.categories.map((category) => (
                <span key={category.id}>{category.name}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
