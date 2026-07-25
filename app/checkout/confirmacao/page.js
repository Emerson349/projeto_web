'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function ConfirmacaoContent() {
  const params = useSearchParams();
  const pedidoId = params.get('pedido');
  const metodo = params.get('metodo');

  return (
    <section className="page-section">
      <div className="container confirmation-page">
        <div className="confirmation-card">
          <div className="confirmation-icon">✓</div>
          <h1 className="page-title">Pedido Confirmado!</h1>
          <p className="confirmation-order-id">
            Pedido <strong>#{pedidoId}</strong>
          </p>
          <p className="page-description">
            Seu pedido foi registrado com sucesso. Você receberá atualizações por e-mail.
          </p>

          {metodo === 'pix' && (
            <div className="confirmation-payment-info pix-info">
              <h2>◈ Pagamento via PIX</h2>
              <p>Realize o pagamento usando os dados abaixo:</p>
              <div className="pix-details">
                <div className="pix-qr-placeholder">
                  <span>QR Code</span>
                  <p>PIX será gerado após integração com gateway</p>
                </div>
                <div className="pix-key-info">
                  <p><strong>Chave PIX (CNPJ):</strong></p>
                  <code>00.000.000/0001-00</code>
                  <p className="pix-note">
                    Após o pagamento, a confirmação será processada automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {metodo === 'cartao' && (
            <div className="confirmation-payment-info card-info">
              <h2>▭ Pagamento com Cartão</h2>
              <p>
                Seu pagamento está sendo processado. Você receberá a confirmação
                por e-mail assim que aprovado pela operadora.
              </p>
              <div className="card-processing">
                <div className="processing-spinner" />
                <span>Processando pagamento...</span>
              </div>
            </div>
          )}

          <div className="confirmation-actions">
            <Link className="button" href="/produtos">
              Continuar comprando
            </Link>
            <Link className="button secondary" href="/">
              Voltar ao início
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
          <p>Carregando confirmação...</p>
        </div>
      </section>
    }>
      <ConfirmacaoContent />
    </Suspense>
  );
}
