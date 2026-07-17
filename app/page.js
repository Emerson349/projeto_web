import Link from 'next/link';
import ProductList from '@/components/ProductList';
import { getFeaturedProducts } from '@/repositories/productsRepository';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let products = [];

  try {
    products = await getFeaturedProducts();
  } catch (error) {
    products = [];
  }

  return (
    <>
      <section className="home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">COMPIA Editora</p>
            <h1>Livros acadêmicos sobre Inteligência Artificial.</h1>
            <p>
              Catálogo especializado para estudantes, docentes e pesquisadores que buscam
              fundamentos, aplicações e debates críticos sobre IA.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/produtos">Explorar catálogo</Link>
              <Link className="button secondary" href="/admin/produtos">Acessar admin</Link>
            </div>
          </div>
          <div className="hero-panel" aria-label="Temas editoriais">
            <span>Machine Learning</span>
            <span>Ética em IA</span>
            <span>LLMs</span>
            <span>Pesquisa Aplicada</span>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="page-header">
            <h2 className="page-title">Destaques</h2>
            <p className="page-description">
              Produtos marcados como destaque no painel administrativo aparecem aqui.
            </p>
          </div>
          <ProductList products={products} />
        </div>
      </section>
    </>
  );
}
