import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

let pool;

function getSslConfig() {
  const caPath = process.env.MYSQL_SSL_CA_PATH;

  if (!caPath) {
    return { rejectUnauthorized: false };
  }

  try {
    // Resolve o caminho absoluto a partir da raiz do projeto
    const absolutePath = path.resolve(process.cwd(), caPath);
    const caCertificate = fs.readFileSync(absolutePath);
    
    return {
      ca: caCertificate,
      rejectUnauthorized: true
    };
  } catch (error) {
    console.error("Erro ao ler o arquivo de certificado SSL ca.pem:", error.message);
    // Fallback seguro caso o arquivo suma por algum motivo durante o dev
    return { rejectUnauthorized: false };
  }
}

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: getSslConfig()
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export default getPool();