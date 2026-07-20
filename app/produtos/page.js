import PublicCatalog from '@/components/PublicCatalog';
import { getAllCategories } from '@/repositories/categoriesRepository';
import { getProducts } from '@/repositories/productsRepository';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  let products = [];
  let categories = [];
  let loadError = false;

  try {
    [products, categories] = await Promise.all([getProducts(), getAllCategories()]);
  } catch (error) {
  console.error(error);
  loadError = true;
}

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Catálogo</h1>
          <p className="page-description">
            Consulte livros físicos e e-books da COMPIA Editora na área de Inteligência
            Artificial.
          </p>
        </div>
        {loadError ? (
          <p className="error-message">Não foi possível carregar o catálogo.</p>
        ) : (
          <PublicCatalog products={products} categories={categories} />
        )}
      </div>
    </section>
  );
}
