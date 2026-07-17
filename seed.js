const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  console.log('=== Inserindo Dados de Teste (Seed) no Aiven ===');

  // 1. Carrega o .env.local
  const envPath = path.join(__dirname, '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;
    const key = trimmed.substring(0, separatorIndex).trim();
    let val = trimmed.substring(separatorIndex + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  });

  // 2. Configura SSL
  const absolutePath = path.resolve(__dirname, process.env.MYSQL_SSL_CA_PATH);
  const sslConfig = { ca: fs.readFileSync(absolutePath), rejectUnauthorized: true };

  // 3. Conecta ao Banco
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    ssl: sslConfig
  });

  try {
    console.log('Inserindo categorias e tags...');
    // Inserir uma categoria de teste
    await connection.query(`
      INSERT INTO categories (name, slug) 
      VALUES ('Inteligência Artificial', 'inteligencia-artificial')
      ON DUPLICATE KEY UPDATE name=name;
    `);

    // Inserir uma tag de teste
    await connection.query(`
      INSERT INTO tags (name, slug) 
      VALUES ('Machine Learning', 'machine-learning')
      ON DUPLICATE KEY UPDATE name=name;
    `);

    console.log('Inserindo livro de teste...');
    // Inserir um produto (Livro Físico) de teste para a editora
    await connection.query(`
      INSERT INTO products (title, slug, author, description, price, format, cover_url, isbn, publication_year, pages) 
      VALUES (
        'Introdução à IA de Alta Qualidade', 
        'introducao-ia-alta-qualidade', 
        'Autor Teste',
        'Livro introdutório cobrindo arquitetura de software inteligente e IA.', 
        89.90, 
        'fisico', 
        'https://placehold.co/400x600',
        '1234567890',
        2026,
        200
      )
      ON DUPLICATE KEY UPDATE title=title;
    `);

    console.log('🎉 Dados de teste inseridos com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao inserir dados:', err.message);
  } finally {
    await connection.end();
  }
}

main();