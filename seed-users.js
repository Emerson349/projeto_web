const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('=== Inicializando tabela de usuários e Seed de Usuários (RBAC) ===\n');

  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
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
  }

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
    console.log('✓ Conectado ao banco de dados!');

    // 1. Criar tabela users se não existir
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'editor', 'vendedor') NOT NULL DEFAULT 'editor',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabela `users` verificada/criada com sucesso!');

    // 2. Definir usuários padrão
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const initialUsers = [
      {
        name: 'Administrador do Sistema',
        email: 'admin@compia.com.br',
        password_hash: passwordHash,
        role: 'admin'
      },
      {
        name: 'Editor de Conteúdo',
        email: 'editor@compia.com.br',
        password_hash: passwordHash,
        role: 'editor'
      },
      {
        name: 'Vendedor / Operador',
        email: 'vendedor@compia.com.br',
        password_hash: passwordHash,
        role: 'vendedor'
      }
    ];

    for (const u of initialUsers) {
      const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [u.email]);
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, TRUE)',
          [u.name, u.email, u.password_hash, u.role]
        );
        console.log(`   + Usuário criado: ${u.email} (${u.role})`);
      } else {
        console.log(`   ℹ️ Usuário já existe: ${u.email} (${u.role})`);
      }
    }

    console.log('\n🎉 Tabela e usuários RBAC inicializados com sucesso!');
    console.log(`   Senha padrão inicial: "${defaultPassword}"`);
  } catch (err) {
    console.error('❌ Erro no seed de usuários:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

main();
