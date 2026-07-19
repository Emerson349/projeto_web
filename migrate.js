const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  console.log('=== Executando Schema no Banco de Dados (TiDB) ===');

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

  // 2. Conecta ao Banco (O TiDB usa SSL nativo sem precisar de arquivo CA físico)
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 4000), // TiDB geralmente usa a porta 4000
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    ssl: { 
      minVersion: 'TLSv1.2', 
      rejectUnauthorized: true 
    },
    multipleStatements: true // Permite rodar o arquivo SQL inteiro de uma vez
  });

  // 3. Lê e Executa o schema.sql
  try {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    console.log(`Lendo o arquivo schema.sql em: ${schemaPath}...`);
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Enviando comandos para o TiDB...');
    await connection.query(sql);
    console.log('🎉 Tabelas criadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar as tabelas:', err.message);
  } finally {
    await connection.end();
  }
}

main();