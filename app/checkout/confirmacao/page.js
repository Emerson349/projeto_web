'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

function ConfirmacaoContent() {
  const router = useRouter();
  const params = useSearchParams();
  const pedidoId = params.get('pedido');
  const metodo = params.get('metodo');

  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('pendente');
  const [isCopied, setIsCopied] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Carrega detalhes do pedido
  useEffect(() => {
    if (!pedidoId) return;

    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${pedidoId}`);
        const data = await res.json();
        if (res.ok && data.order) {
          setOrder(data.order);
          setOrderStatus(data.order.status);
        }
      } catch (err) {
        console.error('Erro ao carregar pedido:', err);
      }
    }

    loadOrder();
  }, [pedidoId]);

  // Simula a aprovação do pagamento no cartão após 2.5s se ainda for pendente
  useEffect(() => {
    if (metodo === 'cartao' && pedidoId && orderStatus === 'pendente') {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/orders/${pedidoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'pago' }),
          });
          if (res.ok) {
            setOrderStatus('pago');
          }
        } catch (err) {
          console.error('Erro ao aprovar cartão:', err);
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [metodo, pedidoId, orderStatus]);

  // Função para copiar chave PIX
  function handleCopyPix(pixPayload) {
    navigator.clipboard.writeText(pixPayload);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  }

  // Função para marcar como PAGO e voltar para a página inicial
  async function handleFinishAndGoHome() {
    setIsFinishing(true);
    try {
      if (pedidoId) {
        await fetch(`/api/orders/${pedidoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'pago' }),
        });
      }
    } catch (err) {
      console.error('Erro ao encerrar pedido:', err);
    } finally {
      router.push('/');
    }
  }

  const orderTotalFormatted = order ? formatPrice(order.total) : 'R$ 0,00';
  const pixPayload = `00020126580014BR.GOV.BCB.PIX0136compia.editora.ufcg@gmail.com5204000053039865405${order?.total || '89.90'}5802BR5914COMPIA EDITORA6014CAMPINA GRANDE62070503***6304`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`;

  const isPaid = orderStatus === 'pago';

  return (
    <section className="page-section">
      <div className="container confirmation-page">
        <div className="confirmation-card">
          <div className={`confirmation-icon ${isPaid ? 'paid' : ''}`}>
            {isPaid ? '✓' : '⌛'}
          </div>
          <h1 className="page-title">
            {isPaid ? 'Pedido Aprovado!' : 'Pedido Confirmado!'}
          </h1>
          <p className="confirmation-order-id">
            Pedido <strong>#{pedidoId}</strong> — Status: <span className={`order-status-badge ${isPaid ? 'status-pago' : 'status-pendente'}`}>
              {isPaid ? '✅ Pago' : '⏳ Aguardando Pagamento'}
            </span>
          </p>
          <p className="page-description">
            {isPaid
              ? 'Seu pagamento foi confirmado com sucesso. O pedido já está sendo preparado.'
              : 'Seu pedido foi registrado. Conclua o pagamento via PIX para liberação.'
            }
          </p>

          {/* SESSÃO PIX */}
          {metodo === 'pix' && (
            <div className="confirmation-payment-info pix-info">
              <h2>◈ Pagamento via PIX</h2>
              
              {isPaid ? (
                <div className="payment-approved-box">
                  <div className="approved-icon">🎉</div>
                  <div>
                    <h3>Pagamento PIX Confirmado!</h3>
                    <p>O comprovante foi registrado no pedido #{pedidoId}.</p>
                  </div>
                </div>
              ) : (
                <>
                  <p>Escaneie o QR Code abaixo para pagar <strong>{orderTotalFormatted}</strong>:</p>

                  <div className="pix-details-grid">
                    <div className="pix-qr-container">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code PIX"
                        width={180}
                        height={180}
                        style={{ borderRadius: '8px', border: '1px solid #ddd' }}
                      />
                      <small style={{ display: 'block', marginTop: '6px', color: '#666' }}>Válido por 30 minutos</small>
                    </div>

                    <div className="pix-key-info">
                      <p><strong>PIX Copia e Cola:</strong></p>
                      <textarea
                        readOnly
                        value={pixPayload}
                        rows={3}
                        style={{
                          width: '100%',
                          fontSize: '0.78rem',
                          fontFamily: 'monospace',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid var(--color-border)',
                          background: '#f9fafb',
                          resize: 'none',
                        }}
                      />
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => handleCopyPix(pixPayload)}
                        style={{ width: '100%', marginTop: '8px' }}
                      >
                        {isCopied ? '✅ Chave Copiada!' : '📋 Copiar Código PIX'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* SESSÃO CARTÃO DE CRÉDITO */}
          {metodo === 'cartao' && (
            <div className="confirmation-payment-info card-info">
              <h2>▭ Pagamento com Cartão de Crédito</h2>

              {isPaid ? (
                <div className="payment-approved-box">
                  <div className="approved-icon">💳</div>
                  <div>
                    <h3>Cartão Aprovado com Sucesso!</h3>
                    <p>Transação autorizada pela operadora. Autorização: <strong>#MP-789204</strong></p>
                  </div>
                </div>
              ) : (
                <div>
                  <p>Sua transação está sendo autenticada com a adquirente...</p>
                  <div className="card-processing">
                    <div className="processing-spinner" />
                    <span>Comunicando com a operadora do cartão...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOTOES DE AÇÃO */}
          <div className="confirmation-actions">
            <button
              type="button"
              className="button"
              onClick={handleFinishAndGoHome}
              disabled={isFinishing}
            >
              {isFinishing ? 'Concluindo...' : 'Encerrar e Voltar ao Início'}
            </button>
            <Link className="button secondary" href="/meus-pedidos">
              Ver Meus Pedidos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ConfirmacaoPage() {
  return (
    <Suspense fallback={
      <section className="page-section">
        <div className="container confirmation-page">
          <p>Carregando confirmação do pedido...</p>
        </div>
      </section>
    }>
      <ConfirmacaoContent />
    </Suspense>
  );
}
