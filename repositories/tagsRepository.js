import { query } from '@/lib/db';

export async function getAllTags() {
  return query(`
    SELECT id, name, slug
    FROM tags
    ORDER BY name ASC
  `);
}

export async function getTagsByProductId(productId) {
  return query(
    `
      SELECT t.id, t.name, t.slug
      FROM tags t
      INNER JOIN product_tags pt ON pt.tag_id = t.id
      WHERE pt.product_id = ?
      ORDER BY t.name ASC
    `,
    [productId]
  );
}
