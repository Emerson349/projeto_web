import mysql from 'mysql2/promise';

let pool;

function getSslConfig() {
  // O TiDB só exige a ativação mínima do SSL padrão nativo do Node
  return {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  };
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