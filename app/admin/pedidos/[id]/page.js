'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

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
  pendente: { label: 'Pendente', class: 'status-pendente' },
  pago: { label: 'Pago', class: 'status-pago' },
  enviado: { label: 'Enviado', class: 'status-enviado' },
  entregue: { label: 'Entregue', class: 'status-entregue' },
  cancelado: { label: 'Cancelado', class: 'status-cancelado' },
};

export default function AdminOrderDetailPage({ params }) {
  const { id } = use(params);
  const { adminPassword, isAuthenticated } = useAdminAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadOrder() {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Não foi possível carregar o pedido.');
      } else {
        setOrder(data.order);
        setNewStatus(data.order.status);
      }
      setIsLoading(false);
    }

    loadOrder();
  }, [isAuthenticated, id]);

  async function handleStatusUpdate(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar status.');
      }

      setOrder(data.order);
      setSuccessMessage(`Status do pedido #${id} atualizado para "${STATUS_LABELS[newStatus]?.label || newStatus}" com sucesso!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) return <p>Carregando detalhe do pedido...</p>;
  if (error && !order) return <p className="error-message">{error}</p>;
  if (!order) return <p className="error-message">Pedido não encontrado.</p>;

  const statusInfo = STATUS_LABELS[order.status] || { label: order.status, class: '' };

  return (
    <div className="admin-order-detail">
      <Link href="/admin/pedidos" className="back-link">← Voltar para lista de pedidos</Link>
      
      <div className="admin-heading" style={{ marginTop: '16px' }}>
        <div>
          <h1>Pedido #{order.id}</h1>
          <p>Realizado em {formatDate(order.created_at)}</p>
        </div>
        <span className={`order-status-badge ${statusInfo.class}`} style={{ fontSize: '1rem', padding: '6px 14px' }}>
          {statusInfo.label}
        </span>
      </div>

      {error ? <p className="error-message">{error}</p> : null}
      {successMessage ? <p className="success-message">{successMessage}</p> : null}

      {/* Alterar Status */}
      <form onSubmit={handleStatusUpdate} className="admin-status-form">
        <label htmlFor="statusSelect"><strong>Alterar Status do Pedido:</strong></label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            id="statusSelect"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', flex: 1 }}
          >
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <button className="button" type="submit" disabled={isUpdating || newStatus === order.status}>
            {isUpdating ? 'Salvando...' : 'Atualizar Status'}
          </button>
        </div>
      </form>

      <div className="admin-order-grid">
        {/* Dados do Cliente */}
        <div className="admin-order-card">
          <h2>👤 Dados do Cliente</h2>
          <dl className="admin-order-dl">
            <dt>Nome:</dt>
            <dd>{order.customer_name}</dd>
            <dt>E-mail:</dt>
            <dd>{order.customer_email}</dd>
            <dt>Telefone:</dt>
            <dd>{order.customer_phone}</dd>
            <dt>CPF:</dt>
            <dd>{order.customer_cpf}</dd>
          </dl>
        </div>

        {/* Endereço de Entrega */}
        <div className="admin-order-card">
          <h2>📍 Entrega & Pagamento</h2>
          <dl className="admin-order-dl">
            <dt>Forma de Envio:</dt>
            <dd style={{ textTransform: 'capitalize' }}>{order.shipping_method} ({formatPrice(order.shipping_cost)})</dd>
            <dt>Forma de Pagamento:</dt>
            <dd style={{ textTransform: 'uppercase' }}>{order.payment_method}</dd>
            <dt>Endereço:</dt>
            <dd>{order.shipping_address}, {order.shipping_number} {order.shipping_complement ? `(${order.shipping_complement})` : ''}</dd>
            <dt>Bairro/Cidade/UF:</dt>
            <dd>{order.shipping_neighborhood} — {order.shipping_city}/{order.shipping_state}</dd>
            <dt>CEP:</dt>
            <dd>{order.shipping_cep}</dd>
          </dl>
        </div>
      </div>

      {/* Itens do Pedido */}
      <div className="admin-order-card" style={{ marginTop: '20px' }}>
        <h2>📦 Itens do Pedido</h2>
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço Unitário</th>
              <th>Qtd</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.title}</strong></td>
                <td>{formatPrice(item.price)}</td>
                <td>{item.quantity}</td>
                <td><strong>{formatPrice(item.price * item.quantity)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="checkout-summary-totals" style={{ marginTop: '16px', maxWidth: '300px', marginLeft: 'auto' }}>
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Frete</span>
            <span>{order.shipping_cost === 0 ? 'Grátis' : formatPrice(order.shipping_cost)}</span>
          </div>
          <div className="checkout-summary-row checkout-summary-total">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
