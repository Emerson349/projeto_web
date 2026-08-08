import { query } from '@/lib/db';

export async function findUserByEmail(email) {
  if (!email) return null;
  const rows = await query('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [
    String(email).toLowerCase().trim()
  ]);
  return rows[0] || null;
}

export async function findUserById(id) {
  if (!id) return null;
  const rows = await query('SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?', [
    id
  ]);
  return rows[0] || null;
}

export async function listUsers() {
  const rows = await query(
    'SELECT id, name, email, role, is_active, created_at, updated_at FROM users ORDER BY id DESC'
  );
  return rows;
}

export async function createUser({ name, email, passwordHash, role = 'editor' }) {
  const cleanEmail = String(email).toLowerCase().trim();
  const cleanRole = ['admin', 'editor', 'vendedor'].includes(role) ? role : 'editor';

  const result = await query(
    'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, TRUE)',
    [name, cleanEmail, passwordHash, cleanRole]
  );
  return result.insertId;
}

export async function updateUser(id, { name, email, role, is_active, passwordHash }) {
  const updates = [];
  const params = [];

  if (name !== undefined) {
    updates.push('name = ?');
    params.push(name);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    params.push(String(email).toLowerCase().trim());
  }
  if (role !== undefined && ['admin', 'editor', 'vendedor'].includes(role)) {
    updates.push('role = ?');
    params.push(role);
  }
  if (is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(Boolean(is_active));
  }
  if (passwordHash) {
    updates.push('password_hash = ?');
    params.push(passwordHash);
  }

  if (updates.length === 0) return false;

  params.push(id);
  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
  return true;
}
