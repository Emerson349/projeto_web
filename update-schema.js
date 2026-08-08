<<<<<<< HEAD
'use client';

import { useState } from 'react';
import Link from 'next/link';

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

function formatDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

const STATUS_LABELS = {
  pendente: {
    label: 'Aguardando Pagamento',
    class: 'status-pendente',
    icon: '⏳'
  },
  pago: {
    label: 'Pagamento Confirmado',
    class: 'status-pago',
    icon: '☑️'
  },
  enviado: {
    label: 'Pedido Enviado',
    class: 'status-enviado',
    icon: '🚚'
  },
  entregue: {
    label: 'Entregue',
    class: 'status-entregue',
    icon: '🎉'
  },
  cancelado: {
    label: 'Cancelado',
    class: 'status-cancelado',
    icon: '❌'
  }
};

export default function MeusPedidosPage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchedEmail, setSearchedEmail] = useState('');

  async function fetchOrdersByEmail(queryEmail) {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(
        `/api/orders/customer?email=${encodeURIComponent(queryEmail)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Erro ao buscar pedidos.'
        );
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();

    if (!email.trim()) return;

    setSearchedEmail(email.trim());

    await fetchOrdersByEmail(email.trim());
  }

  async function cancelOrder(orderId) {
    if (!searchedEmail) {
      return setError(
        'Informe seu e-mail e busque os pedidos antes de cancelar.'
      );
    }

    setError('');

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'cancelado',
          customer_email: searchedEmail
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Erro ao cancelar pedido.'
        );
      }

      await fetchOrdersByEmail(searchedEmail);
    } catch (err) {
      setError(err.message);
    }
  }

  function getPaymentLabel(order) {
    if (order.payment_method === 'cartao') {
      const installments = Number(
        order.card_installments || 1
      );

      const total = Number(order.total || 0);

      const installmentValue =
        total / installments;

      if (installments > 1) {
        return (
          <>
            Cartão de Crédito — {installments}x de{' '}
            {formatPrice(installmentValue)}
          </>
        );
      }

      return 'Cartão de Crédito — 1x';
    }

    if (order.payment_method === 'pix') {
      return 'PIX';
    }

    return order.payment_method
      ? order.payment_method.toUpperCase()
      : 'Não informado';
  }

  return (
    <section className="page-section">
      <div
        className="container"
        style={{
          maxWidth: '840px',
          margin: '0 auto'
        }}
      >
        <div className="page-header">
          <h1 className="page-title">
            Meus Pedidos
          </h1>

          <p className="page-description">
            Informe o e-mail utilizado na compra para
            consultar o histórico e o status dos seus pedidos.
          </p>
        </div>

        {/* FORMULÁRIO DE BUSCA */}
        <form
          onSubmit={handleSearch}
          className="customer-order-search-form"
        >
          <div
            className="form-row"
            style={{ flex: 1 }}
          >
            <label htmlFor="customerEmail">
              Seu E-mail
            </label>

            <input
              id="customerEmail"
              type="email"
              placeholder="Ex: joao@email.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <button
            className="button"
            type="submit"
            disabled={isLoading}
            style={{
              alignSelf: 'flex-end'
            }}
          >
            {isLoading
              ? 'Buscando...'
              : 'Buscar Pedidos'}
          </button>
        </form>

        {/* ERRO */}
        {error && (
          <p
            className="error-message"
            style={{
              marginTop: '16px'
            }}
          >
            {error}
          </p>
        )}

        {/* RESULTADOS */}
        {orders !== null && (
          <div
            style={{
              marginTop: '32px'
            }}
          >
            {orders.length === 0 ? (
              <div
                className="empty-state"
                style={{
                  textAlign: 'center',
                  padding: '40px 20px'
                }}
              >
                <p
                  style={{
                    fontSize: '1.1rem'
                  }}
                >
                  Nenhum pedido encontrado para{' '}
                  <strong>
                    {searchedEmail}
                  </strong>.
                </p>

                <p
                  style={{
                    color: 'var(--color-muted)',
                    marginTop: '8px'
                  }}
                >
                  Verifique se o e-mail foi digitado
                  corretamente.
                </p>
              </div>
            ) : (
              <>
                <p
                  style={{
                    marginBottom: '16px',
                    color: 'var(--color-muted)'
                  }}
                >
                  Exibindo {orders.length}{' '}
                  {orders.length === 1
                    ? 'pedido'
                    : 'pedidos'}{' '}
                  para{' '}
                  <strong>
                    {searchedEmail}
                  </strong>:
                </p>

                <div
                  style={{
                    display: 'grid',
                    gap: '20px'
                  }}
                >
                  {orders.map((order) => {
                    const statusInfo =
                      STATUS_LABELS[order.status] || {
                        label: order.status,
                        class: '',
                        icon: '📦'
                      };

                    const installments = Number(
                      order.card_installments || 1
                    );

                    const installmentValue =
                      installments > 0
                        ? Number(order.total || 0) /
                          installments
                        : Number(order.total || 0);

                    return (
                      <div
                        key={order.id}
                        className="customer-order-card"
                      >
                        {/* CABEÇALHO DO PEDIDO */}
                        <div className="customer-order-header">
                          <div>
                            <span className="customer-order-number">
                              Pedido #{order.id}
                            </span>

                            <span className="customer-order-date">
                              Realizado em{' '}
                              {formatDate(
                                order.created_at
                              )}
                            </span>
                          </div>

                          <span
                            className={`order-status-badge ${statusInfo.class}`}
                          >
                            {statusInfo.icon}{' '}
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* INFORMAÇÕES DO PEDIDO */}
                        <div className="customer-order-meta">
                          <span>
                            <strong>
                              Forma de Envio:
                            </strong>{' '}
                            {order.shipping_method ===
                            'retirada'
                              ? 'Retirada na Editora'
                              : order.shipping_method ===
                                'digital'
                                ? 'Digital'
                                : 'Correios'}
                          </span>

                          <span>
                            <strong>
                              Pagamento:
                            </strong>{' '}
                            {getPaymentLabel(order)}
                          </span>

                          <span>
                            <strong>
                              Destinatário:
                            </strong>{' '}
                            {order.customer_name}{' '}
                            (
                            {order.shipping_city}/
                            {order.shipping_state})
                          </span>
                        </div>

                        {/* ITENS DO PEDIDO */}
                        <div className="customer-order-items">
                          {order.items?.map((item) => (
                            <div
                              key={item.id}
                              className="customer-order-item"
                            >
                              <div>
                                <strong
                                  style={{
                                    fontSize:
                                      '0.95rem'
                                  }}
                                >
                                  {item.title}
                                </strong>

                                {/* QUANTIDADE DO PRODUTO */}
                                <div
                                  style={{
                                    fontSize:
                                      '0.85rem',
                                    color:
                                      'var(--color-muted)'
                                  }}
                                >
                                  Quantidade:{' '}
                                  {item.quantity}{' '}
                                  ×{' '}
                                  {formatPrice(
                                    item.price
                                  )}
                                </div>

                                {/* DOWNLOAD DO E-BOOK */}
                                {item.isDigital &&
                                  order.status ===
                                    'pago' &&
                                  (item.ebook_file ? (
                                    <a
                                      className="button secondary"
                                      style={{
                                        marginTop:
                                          '8px',
                                        fontSize:
                                          '0.8rem',
                                        display:
                                          'inline-block'
                                      }}
                                      href={
                                        item.ebook_file
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      📥 Baixar e-book
                                    </a>
                                  ) : (
                                    <button
                                      type="button"
                                      className="button secondary"
                                      style={{
                                        marginTop:
                                          '8px',
                                        fontSize:
                                          '0.8rem'
                                      }}
                                      disabled
                                    >
                                      📥 Baixar e-book
                                    </button>
                                  ))}
                              </div>

                              <strong
                                style={{
                                  fontSize:
                                    '0.95rem'
                                }}
                              >
                                {formatPrice(
                                  Number(
                                    item.price
                                  ) *
                                    Number(
                                      item.quantity
                                    )
                                )}
                              </strong>
                            </div>
                          ))}
                        </div>

                        {/* RODAPÉ DO PEDIDO */}
                        <div className="customer-order-footer">
                          <div>
                            {Number(
                              order.shipping_cost
                            ) > 0 ? (
                              <span
                                style={{
                                  fontSize:
                                    '0.85rem',
                                  color:
                                    'var(--color-muted)'
                                }}
                              >
                                Frete:{' '}
                                {formatPrice(
                                  order.shipping_cost
                                )}{' '}
                                | Subtotal:{' '}
                                {formatPrice(
                                  order.subtotal
                                )}
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize:
                                    '0.85rem',
                                  color: '#16a34a',
                                  fontWeight: 600
                                }}
                              >
                                Frete Grátis
                              </span>
                            )}
                          </div>

                          {/* TOTAL + PARCELAMENTO */}
                          <div
                            style={{
                              fontSize: '1.2rem',
                              fontWeight: 800
                            }}
                          >
                            <div>
                              Total:{' '}
                              {formatPrice(
                                order.total
                              )}
                            </div>

                            {order.payment_method ===
                              'cartao' &&
                              installments > 1 && (
                                <div
                                  style={{
                                    fontSize:
                                      '0.9rem',
                                    fontWeight: 500,
                                    color:
                                      'var(--color-muted)',
                                    marginTop:
                                      '4px'
                                  }}
                                >
                                  Pagamento:{' '}
                                  {installments}x de{' '}
                                  {formatPrice(
                                    installmentValue
                                  )}
                                </div>
                              )}
                          </div>

                          {/* CANCELAR PEDIDO */}
                          <div
                            style={{
                              marginTop: '12px'
                            }}
                          >
                            {order.status ===
                              'pendente' && (
                              <button
                                type="button"
                                className="button danger"
                                onClick={() =>
                                  cancelOrder(
                                    order.id
                                  )
                                }
                                style={{
                                  marginRight:
                                    '8px'
                                }}
                              >
                                Cancelar Pedido
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
=======
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
>>>>>>> 9300c7233ba989b92c3a7642149bad38db99e4d9
