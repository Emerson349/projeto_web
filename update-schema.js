const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  console.log('=== Executando Alterações e Backups no Banco de Dados (TiDB Compatible) ===\n');

  // 1. Carrega as variáveis do .env.local
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Erro: Arquivo .env.local não encontrado!');
    process.exit(1);
  }

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

  // 2. Conecta ao Banco de Dados
  let connection;
  try {
    connection = await mysql.createConnection({
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
    console.log('✓ Conectado ao banco de dados com sucesso!\n');
  } catch (err) {
    console.error('❌ Erro ao conectar no banco de dados:', err.message);
    process.exit(1);
  }

  try {
    // 1. Criar backup da tabela produtos (Compatível com TiDB)
    console.log('1. Criando backup da tabela `products` (products_backup)...');
    await connection.query('CREATE TABLE IF NOT EXISTS products_backup LIKE products;');
    await connection.query('DELETE FROM products_backup;');
    await connection.query('INSERT INTO products_backup SELECT * FROM products;');
    console.log('   ✓ Tabela `products_backup` sincronizada com sucesso!');

    // 2. Criar backup da tabela pedidos (Compatível com TiDB)
    console.log('2. Criando backup da tabela `orders` (orders_backup)...');
    await connection.query('CREATE TABLE IF NOT EXISTS orders_backup LIKE orders;');
    await connection.query('DELETE FROM orders_backup;');
    await connection.query('INSERT INTO orders_backup SELECT * FROM orders;');
    console.log('   ✓ Tabela `orders_backup` sincronizada com sucesso!');

    // 3. Adicionar coluna ebook_file na tabela products
    console.log('3. Adicionando a coluna `ebook_file` na tabela `products`...');
    try {
      await connection.query('ALTER TABLE products ADD COLUMN ebook_file VARCHAR(500) NULL AFTER cover_url;');
      console.log('   ✓ Coluna `ebook_file` adicionada com sucesso!');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes('Duplicate column name') || err.message.includes('already exists')) {
        console.log('   ℹ️ A coluna `ebook_file` já existe na tabela `products`.');
      } else {
        throw err;
      }
    }

    // 4. Modificar enum de shipping_method na tabela orders
    console.log('4. Atualizando a coluna `shipping_method` na tabela `orders` para aceitar "digital"...');
    await connection.query("ALTER TABLE orders MODIFY COLUMN shipping_method ENUM('correios', 'retirada', 'digital') NOT NULL DEFAULT 'correios';");
    console.log('   ✓ Coluna `shipping_method` modificada com sucesso!');

    console.log('\n🎉 Todas as alterações foram executadas no TiDB com sucesso!');
  } catch (err) {
    console.error('\n❌ Erro durante a execução dos comandos:', err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
