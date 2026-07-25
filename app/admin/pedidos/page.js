'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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

export default function AdminOrdersPage() {
  const { adminPassword, isAuthenticated } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadOrders() {
      setIsLoading(true);
      const response = await fetch('/api/orders', {
        headers: {
          'x-admin-password': adminPassword
        }
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Não foi possível carregar os pedidos.');
      } else {
        setOrders(data.orders || []);
      }
      setIsLoading(false);
    }

    loadOrders();
  }, [isAuthenticated, adminPassword]);

  const filteredOrders = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  return (
    <div>
      <div className="admin-heading">
        <div>
          <h1>Pedidos</h1>
          <p>Acompanhe e gerencie todos os pedidos da loja.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label htmlFor="filterStatus" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Status:</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      {isLoading ? (
        <p>Carregando pedidos...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="admin-orders-table-container">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Pagamento</th>
                <th>Envio</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusInfo = STATUS_LABELS[order.status] || { label: order.status, class: '' };
                return (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>
                      <div><strong>{order.customer_name}</strong></div>
                      <small style={{ color: 'var(--color-muted)' }}>{order.customer_email}</small>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                    <td style={{ textTransform: 'uppercase' }}>{order.payment_method}</td>
                    <td style={{ textTransform: 'capitalize' }}>{order.shipping_method}</td>
                    <td><strong>{formatPrice(order.total)}</strong></td>
                    <td>
                      <span className={`order-status-badge ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <Link className="button secondary" style={{ minHeight: '32px', padding: '4px 10px', fontSize: '0.85rem' }} href={`/admin/pedidos/${order.id}`}>
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
