import { getPool, query } from '@/lib/db';
import { getCategoriesByProductId } from '@/repositories/categoriesRepository';
import { getTagsByProductId } from '@/repositories/tagsRepository';

function normalizeProduct(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    price: Number(row.price),
    is_featured: Boolean(row.is_featured)
  };
}

export function createSlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function hydrateProduct(product) {
  if (!product) {
    return null;
  }

  const [categories, tags] = await Promise.all([
    getCategoriesByProductId(product.id),
    getTagsByProductId(product.id)
  ]);

  return {
    ...product,
    categories,
    tags
  };
}

export async function getProducts(filters = {}) {
  const params = [];
  const where = [];

  if (filters.search) {
    where.push('(p.title LIKE ? OR p.author LIKE ? OR p.description LIKE ?)');
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters.category) {
    where.push('c.slug = ?');
    params.push(filters.category);
  }

  if (filters.format) {
    where.push('p.format = ?');
    params.push(filters.format);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = await query(
    `
      SELECT DISTINCT
        p.id,
        p.title,
        p.slug,
        p.author,
        p.description,
        p.format,
        p.price,
        p.cover_url,
        p.isbn,
        p.publication_year,
        p.pages,
        p.is_featured,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories c ON c.id = pc.category_id
      ${whereSql}
      ORDER BY p.created_at DESC
    `,
    params
  );

  const products = rows.map(normalizeProduct);
  return Promise.all(products.map(hydrateProduct));
}

export async function getFeaturedProducts() {
  const rows = await query(`
    SELECT id, title, slug, author, description, format, price, cover_url, is_featured
    FROM products
    WHERE is_featured = TRUE
    ORDER BY created_at DESC
    LIMIT 4
  `);

  return Promise.all(rows.map(normalizeProduct).map(hydrateProduct));
}

export async function getProductById(id) {
  const rows = await query(
    `
      SELECT id, title, slug, author, description, format, price, cover_url,
        isbn, publication_year, pages, is_featured, created_at, updated_at
      FROM products
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return hydrateProduct(normalizeProduct(rows[0]));
}

export async function getProductBySlug(slug) {
  const rows = await query(
    `
      SELECT id, title, slug, author, description, format, price, cover_url,
        isbn, publication_year, pages, is_featured, created_at, updated_at
      FROM products
      WHERE slug = ?
      LIMIT 1
    `,
    [slug]
  );

  return hydrateProduct(normalizeProduct(rows[0]));
}

export async function createProduct(data) {
  const connection = await getPool().getConnection();
  const slug = data.slug || createSlug(data.title);

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `
        INSERT INTO products (
          title, slug, author, description, format, price, cover_url,
          isbn, publication_year, pages, is_featured
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.title,
        slug,
        data.author,
        data.description,
        data.format,
        data.price,
        data.cover_url || null,
        data.isbn || null,
        data.publication_year || null,
        data.pages || null,
        Boolean(data.is_featured)
      ]
    );

    await syncProductRelations(connection, result.insertId, data.category_ids, data.tag_ids);
    await connection.commit();

    return getProductById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateProduct(id, data) {
  const connection = await getPool().getConnection();
  const slug = data.slug || createSlug(data.title);

  try {
    await connection.beginTransaction();

    await connection.execute(
      `
        UPDATE products
        SET title = ?, slug = ?, author = ?, description = ?, format = ?,
          price = ?, cover_url = ?, isbn = ?, publication_year = ?,
          pages = ?, is_featured = ?
        WHERE id = ?
      `,
      [
        data.title,
        slug,
        data.author,
        data.description,
        data.format,
        data.price,
        data.cover_url || null,
        data.isbn || null,
        data.publication_year || null,
        data.pages || null,
        Boolean(data.is_featured),
        id
      ]
    );

    await syncProductRelations(connection, id, data.category_ids, data.tag_ids);
    await connection.commit();

    return getProductById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteProduct(id) {
  const result = await query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function syncProductRelations(connection, productId, categoryIds = [], tagIds = []) {
  await connection.execute('DELETE FROM product_categories WHERE product_id = ?', [productId]);
  await connection.execute('DELETE FROM product_tags WHERE product_id = ?', [productId]);

  for (const categoryId of categoryIds || []) {
    if (categoryId) {
      await connection.execute(
        'INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)',
        [productId, categoryId]
      );
    }
  }

  for (const tagId of tagIds || []) {
    if (tagId) {
      await connection.execute(
        'INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)',
        [productId, tagId]
      );
    }
  }
}
