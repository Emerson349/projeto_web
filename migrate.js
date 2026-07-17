const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  console.log('=== Executando Schema no Banco de Dados (Aiven) ===');

  // 1. Carrega o .env.local
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Erro: Arquivo .env.local não encontrado!');
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

  // 2. Configura SSL via arquivo físico
  let sslConfig = null;
  if (process.env.MYSQL_SSL_CA_PATH) {
    try {
      const absolutePath = path.resolve(__dirname, process.env.MYSQL_SSL_CA_PATH);
      sslConfig = { ca: fs.readFileSync(absolutePath), rejectUnauthorized: true };
    } catch (err) {
      console.error('Erro ao ler SSL:', err.message);
      process.exit(1);
    }
  } else {
    sslConfig = { rejectUnauthorized: false };
  }

  // 3. Conecta ao Banco
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    ssl: sslConfig,
    multipleStatements: true // Permite rodar o arquivo SQL inteiro de uma vez
  });

  // 4. Lê e Executa o schema.sql
  try {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    console.log(`Lendo o arquivo schema.sql em: ${schemaPath}...`);
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Enviando comandos para o Aiven...');
    await connection.query(sql);
    console.log('🎉 Tabelas criadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar as tabelas:', err.message);
  } finally {
    await connection.end();
  }
}

main();