import { query } from '@/lib/db';

export async function getAllCategories() {
  return query(`
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `);
}

export async function getCategoriesByProductId(productId) {
  return query(
    `
      SELECT c.id, c.name, c.slug
      FROM categories c
      INNER JOIN product_categories pc ON pc.category_id = c.id
      WHERE pc.product_id = ?
      ORDER BY c.name ASC
    `,
    [productId]
  );
}
