const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function checkDatabase() {
  const envPath = path.join(__dirname, '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;
    process.env[trimmed.substring(0, separatorIndex).trim()] = trimmed.substring(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
  });

  const absolutePath = path.resolve(__dirname, process.env.MYSQL_SSL_CA_PATH);
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    ssl: { ca: fs.readFileSync(absolutePath), rejectUnauthorized: true }
  });

  try {
    const [rows] = await connection.query('DESCRIBE products');
    console.log('Columns in products table:');
    console.table(rows);
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await connection.end();
  }
}
checkDatabase();
