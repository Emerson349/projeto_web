const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  // 1. Carrega o .env.local
  const envPath = path.join(__dirname, '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;
    process.env[trimmed.substring(0, separatorIndex).trim()] = trimmed.substring(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
  });

  // 2. Conecta ao TiDB com o SSL nativo do Node.js
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 4000),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    ssl: { 
      minVersion: 'TLSv1.2', 
      rejectUnauthorized: true 
    }
  });

  try {
    // 3. Limpa os dados velhos ignorando as chaves estrangeiras momentaneamente
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE product_categories;');
    await connection.query('TRUNCATE TABLE products;');
    await connection.query('TRUNCATE TABLE categories;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('Inserindo categoria padrão no TiDB...');
    const [catResult] = await connection.query(`
      INSERT INTO categories (name, slug) VALUES ('Destaques', 'destaques')
    `);

    console.log('Inserindo o livro oficial com destaque na COMPIA...');
    // ORDEM CORRIGIDA: title, slug, author, description, format, price, cover_url, is_featured
    const [result] = await connection.query(`
      INSERT INTO products (title, slug, author, description, format, price, cover_url, is_featured) 
      VALUES (
        'Arquiteturas de Software Inteligente', 
        'arquiteturas-de-software-inteligente', 
        'Emerson Henrique',
        'Um guia prático e teórico para construir sistemas modernos com Inteligência Artificial integrada de ponta a ponta.', 
        'fisico',
        129.90, 
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
        TRUE
      )
    `);

    await connection.query(`
      INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)
    `, [result.insertId, catResult.insertId]);

    console.log('🎉 Tudo pronto! Banco do TiDB sincronizado e populado.');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await connection.end();
  }
}

main();