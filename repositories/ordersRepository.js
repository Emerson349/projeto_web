import { getPool, query } from '@/lib/db';

function normalizeOrder(row) {
  if (!row) return null;
  return {
    ...row,
    subtotal: Number(row.subtotal),
    shipping_cost: Number(row.shipping_cost),
    total: Number(row.total),
  };
}

export async function createOrder(data) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO orders (
        customer_name, customer_email, customer_phone, customer_cpf,
        shipping_cep, shipping_address, shipping_number, shipping_complement,
        shipping_neighborhood, shipping_city, shipping_state,
        shipping_method, shipping_cost,
        payment_method, subtotal, total, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,
      [
        data.customer_name,
        data.customer_email,
        data.customer_phone,
        data.customer_cpf,
        data.shipping_cep,
        data.shipping_address,
        data.shipping_number,
        data.shipping_complement || null,
        data.shipping_neighborhood,
        data.shipping_city,
        data.shipping_state,
        data.shipping_method,
        data.shipping_cost,
        data.payment_method,
        data.subtotal,
        data.total,
      ]
    );

    const orderId = result.insertId;

    for (const item of data.items) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, title, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.title, item.price, item.quantity]
      );
    }

    await connection.commit();
    return getOrderById(orderId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getOrderById(id) {
  const rows = await query(
    `SELECT * FROM orders WHERE id = ? LIMIT 1`,
    [id]
  );

  const order = normalizeOrder(rows[0]);
  if (!order) return null;

  /*
  const items = await query(
    `
      SELECT
        oi.*,
        p.format,
        p.ebook_file
      FROM order_items oi
      LEFT JOIN products p
        ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `,
    [id]
  );
  */

  const items = await query(
    `
      SELECT
        oi.*,
        p.format,
        p.ebook_file
      FROM order_items oi
      LEFT JOIN products p
        ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `,
    [id]
  );

  return {
    ...order,
    items: items.map(item => ({
      ...item,
      price: Number(item.price),
      isDigital: item.format === 'digital',
      ebook_file: item.ebook_file || null
    })),
  };
}

export async function getOrders() {
  const rows = await query(
    `SELECT * FROM orders ORDER BY created_at DESC`
  );
  return rows.map(normalizeOrder);
}

export async function updateOrderStatus(id, status) {
  await query(
    `UPDATE orders SET status = ? WHERE id = ?`,
    [status, id]
  );
  return getOrderById(id);
}

export async function getOrdersByEmail(email) {
  const rows = await query(
    `SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC`,
    [email.trim().toLowerCase()]
  );
  
  const orders = rows.map(normalizeOrder);
  return Promise.all(orders.map(async (order) => {
    const items = await query(
      `
        SELECT
          oi.*,
          p.format,
          p.ebook_file
        FROM order_items oi
        LEFT JOIN products p
          ON p.id = oi.product_id
        WHERE oi.order_id = ?
      `,
      [order.id]
    );
    return {
      ...order,
      items: items.map(item => ({
        ...item,
        price: Number(item.price),
        isDigital: item.format === 'digital',
        ebook_file: item.ebook_file || null
      })),
    };
  }));
}

