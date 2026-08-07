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
    icon: '✅'
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
        throw new Error(data.message || 'Erro ao buscar pedidos.');
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
    fetchOrdersByEmail(email.trim());
  }

  async function cancelOrder(orderId) {
    if (!searchedEmail) return setError('Informe seu e-mail e busque os pedidos antes de cancelar.');
    setError('');

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelado', customer_email: searchedEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Erro ao cancelar pedido.');
      }

      // Atualiza a lista
      fetchOrdersByEmail(searchedEmail);
    } catch (err) {
      setError(err.message);
    }
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
          <h1 className="page-title">Meus Pedidos</h1>

          <p className="page-description">
            Informe o e-mail utilizado na compra para consultar o histórico e o
            status dos seus pedidos.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="customer-order-search-form"
        >
          <div
            className="form-row"
            style={{ flex: 1 }}
          >
            <label htmlFor="customerEmail">Seu E-mail</label>

            <input
              id="customerEmail"
              type="email"
              placeholder="Ex: joao@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className="button"
            type="submit"
            disabled={isLoading}
            style={{ alignSelf: 'flex-end' }}
          >
            {isLoading ? 'Buscando...' : 'Buscar Pedidos'}
          </button>
        </form>

        {error && (
          <p
            className="error-message"
            style={{ marginTop: '16px' }}
          >
            {error}
          </p>
        )}

        {orders !== null && (
          <div style={{ marginTop: '32px' }}>
            {orders.length === 0 ? (
              <div
                className="empty-state"
                style={{
                  textAlign: 'center',
                  padding: '40px 20px'
                }}
              >
                <p style={{ fontSize: '1.1rem' }}>
                  Nenhum pedido encontrado para{' '}
                  <strong>{searchedEmail}</strong>.
                </p>

                <p
                  style={{
                    color: 'var(--color-muted)',
                    marginTop: '8px'
                  }}
                >
                  Verifique se o e-mail foi digitado corretamente.
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
                  {orders.length === 1 ? 'pedido' : 'pedidos'} para{' '}
                  <strong>{searchedEmail}</strong>:
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

                    return (
                      <div
                        key={order.id}
                        className="customer-order-card"
                      >
                        <div className="customer-order-header">
                          <div>
                            <span className="customer-order-number">
                              Pedido #{order.id}
                            </span>

                            <span className="customer-order-date">
                              Realizado em {formatDate(order.created_at)}
                            </span>
                          </div>

                          <span
                            className={`order-status-badge ${statusInfo.class}`}
                          >
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>

                        <div className="customer-order-meta">
                          <span>
                            <strong>Forma de Envio:</strong>{' '}
                            {order.shipping_method === 'retirada'
                              ? 'Retirada na Editora'
                              : 'Correios'}
                          </span>

                          <span>
                            <strong>Pagamento:</strong>{' '}
                            {order.payment_method.toUpperCase()}
                          </span>

                          <span>
                            <strong>Destinatário:</strong>{' '}
                            {order.customer_name} (
                            {order.shipping_city}/{order.shipping_state})
                          </span>
                        </div>

                        <div className="customer-order-items">
                          {order.items?.map((item) => (
                            <div
                              key={item.id}
                              className="customer-order-item"
                            >
                              <div>
                                <strong
                                  style={{
                                    fontSize: '0.95rem'
                                  }}
                                >
                                  {item.title}
                                </strong>

                                <div
                                  style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--color-muted)'
                                  }}
                                >
                                  {item.quantity}×{' '}
                                  {formatPrice(item.price)}
                                </div>

                                {item.isDigital && order.status === 'pago' && (
                                  item.ebook_file ? (
                                    <a
                                      className="button secondary"
                                      style={{ marginTop: '8px', fontSize: '0.8rem', display: 'inline-block' }}
                                      href={item.ebook_file}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      📥 Baixar e-book
                                    </a>
                                  ) : (
                                    <button
                                      type="button"
                                      className="button secondary"
                                      style={{ marginTop: '8px', fontSize: '0.8rem' }}
                                      disabled
                                    >
                                      📥 Baixar e-book
                                    </button>
                                  )
                                )}
                              </div>

                              <strong
                                style={{
                                  fontSize: '0.95rem'
                                }}
                              >
                                {formatPrice(
                                  item.price * item.quantity
                                )}
                              </strong>
                            </div>
                          ))}
                        </div>

                        <div className="customer-order-footer">
                          <div>
                            {order.shipping_cost > 0 ? (
                              <span
                                style={{
                                  fontSize: '0.85rem',
                                  color: 'var(--color-muted)'
                                }}
                              >
                                Frete:{' '}
                                {formatPrice(order.shipping_cost)} |
                                Subtotal:{' '}
                                {formatPrice(order.subtotal)}
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: '0.85rem',
                                  color: '#16a34a',
                                  fontWeight: 600
                                }}
                              >
                                Frete Grátis
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: '1.2rem',
                              fontWeight: 800
                            }}
                          >
                            Total: {formatPrice(order.total)}
                          </div>

                          <div style={{ marginTop: '12px' }}>
                            {order.status === 'pendente' && (
                              <button
                                type="button"
                                className="button danger"
                                onClick={() => cancelOrder(order.id)}
                                style={{ marginRight: '8px' }}
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