'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

function maskCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function maskCep(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, '$1-$2');
}

function calcularFrete(cepLimpo) {
  const digito = parseInt(cepLimpo.substring(0, 2), 10);

  if (digito === 58) {
    return { cost: 0, method: 'retirada', label: 'Retirada na Sede da Editora (Grátis)' };
  }

  if (
    (digito >= 1 && digito <= 19) ||
    (digito >= 20 && digito <= 28) ||
    digito === 29 ||
    (digito >= 30 && digito <= 39)
  ) {
    return { cost: 15.90, method: 'correios', label: 'Correios — Região Sudeste' };
  }

  return { cost: 24.50, method: 'correios', label: 'Correios — Demais regiões' };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, totalItems, clearCart } = useCart();

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_cpf: '',
    shipping_cep: '',
    shipping_address: '',
    shipping_number: '',
    shipping_complement: '',
    shipping_neighborhood: '',
    shipping_city: '',
    shipping_state: '',
    payment_method: 'pix',
  });

  const [freteInfo, setFreteInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  function updateField(name, value) {
    setForm(current => ({ ...current, [name]: value }));
  }

  function handleCepChange(rawValue) {
    const masked = maskCep(rawValue);
    updateField('shipping_cep', masked);

    const digits = rawValue.replace(/\D/g, '');
    if (digits.length === 8) {
      const info = calcularFrete(digits);
      setFreteInfo(info);
    } else {
      setFreteInfo(null);
    }
  }

  const shippingCost = freteInfo?.cost ?? 0;
  const shippingMethod = freteInfo?.method ?? 'correios';
  const grandTotal = totalPrice + shippingCost;

  const hasPhysical = cart.some(item => item.format !== 'digital' && item.format !== 'ebook');

  function validateStep1() {
    if (!form.customer_name.trim()) return 'Informe seu nome completo.';
    if (!form.customer_email.trim() || !form.customer_email.includes('@')) return 'Informe um e-mail válido.';
    if (form.customer_phone.replace(/\D/g, '').length < 10) return 'Informe um telefone válido.';
    if (form.customer_cpf.replace(/\D/g, '').length !== 11) return 'Informe um CPF válido.';
    return '';
  }

  function validateStep2() {
    if (form.shipping_cep.replace(/\D/g, '').length !== 8) return 'Informe um CEP válido.';
    if (!form.shipping_address.trim()) return 'Informe o endereço.';
    if (!form.shipping_number.trim()) return 'Informe o número.';
    if (!form.shipping_neighborhood.trim()) return 'Informe o bairro.';
    if (!form.shipping_city.trim()) return 'Informe a cidade.';
    if (!form.shipping_state) return 'Selecione o estado.';
    return '';
  }

  function handleNextStep() {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
      setStep(3);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const orderData = {
      ...form,
      shipping_method: shippingMethod,
      shipping_cost: shippingCost,
      items: cart.map(item => ({
        product_id: item.id,
        title: item.title || item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao processar pedido.');
      }

      clearCart();
      router.push(`/checkout/confirmacao?pedido=${data.order.id}&metodo=${form.payment_method}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <section className="page-section">
        <div className="container checkout-empty">
          <div className="checkout-empty-icon">🛒</div>
          <h1 className="page-title">Carrinho vazio</h1>
          <p className="page-description">Adicione produtos ao carrinho antes de finalizar a compra.</p>
          <Link className="button" href="/produtos">Explorar catálogo</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container checkout-layout">
        {/* FORMULÁRIO */}
        <div className="checkout-form-area">
          <div className="page-header">
            <h1 className="page-title">Finalizar Compra</h1>
            <p className="page-description">Preencha os dados para concluir seu pedido.</p>
          </div>

          {/* Indicador de etapas */}
          <div className="checkout-steps">
            <button
              type="button"
              className={`checkout-step-btn ${step >= 1 ? 'active' : ''}`}
              onClick={() => { setError(''); setStep(1); }}
            >
              <span className="step-number">1</span>
              <span className="step-label">Dados Pessoais</span>
            </button>
            <div className="step-divider" />
            <button
              type="button"
              className={`checkout-step-btn ${step >= 2 ? 'active' : ''}`}
              onClick={() => {
                const err = validateStep1();
                if (err) { setError(err); return; }
                setError(''); setStep(2);
              }}
            >
              <span className="step-number">2</span>
              <span className="step-label">Endereço</span>
            </button>
            <div className="step-divider" />
            <button
              type="button"
              className={`checkout-step-btn ${step >= 3 ? 'active' : ''}`}
              onClick={() => {
                const err1 = validateStep1();
                if (err1) { setError(err1); setStep(1); return; }
                const err2 = validateStep2();
                if (err2) { setError(err2); setStep(2); return; }
                setError(''); setStep(3);
              }}
            >
              <span className="step-number">3</span>
              <span className="step-label">Pagamento</span>
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            {/* ETAPA 1 — Dados Pessoais */}
            {step === 1 && (
              <div className="checkout-section">
                <h2 className="checkout-section-title">👤 Dados Pessoais</h2>
                <div className="form-grid">
                  <div className="form-row">
                    <label htmlFor="customer_name">Nome completo</label>
                    <input
                      id="customer_name"
                      value={form.customer_name}
                      onChange={e => updateField('customer_name', e.target.value)}
                      placeholder="Ex: João da Silva"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="customer_email">E-mail</label>
                    <input
                      id="customer_email"
                      type="email"
                      value={form.customer_email}
                      onChange={e => updateField('customer_email', e.target.value)}
                      placeholder="Ex: joao@email.com"
                      required
                    />
                  </div>
                  <div className="form-columns">
                    <div className="form-row">
                      <label htmlFor="customer_phone">Telefone</label>
                      <input
                        id="customer_phone"
                        value={form.customer_phone}
                        onChange={e => updateField('customer_phone', maskPhone(e.target.value))}
                        placeholder="(83) 99999-9999"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="customer_cpf">CPF</label>
                      <input
                        id="customer_cpf"
                        value={form.customer_cpf}
                        onChange={e => updateField('customer_cpf', maskCpf(e.target.value))}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                  </div>
                  <button type="button" className="button" onClick={handleNextStep}>
                    Continuar para Endereço →
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2 — Endereço */}
            {step === 2 && (
              <div className="checkout-section">
                <h2 className="checkout-section-title">📍 Endereço de Entrega</h2>
                <div className="form-grid">
                  <div className="form-columns">
                    <div className="form-row">
                      <label htmlFor="shipping_cep">CEP</label>
                      <input
                        id="shipping_cep"
                        value={form.shipping_cep}
                        onChange={e => handleCepChange(e.target.value)}
                        placeholder="58000-000"
                        required
                      />
                      {freteInfo && (
                        <p className="frete-feedback">
                          {freteInfo.cost === 0
                            ? '✅ ' + freteInfo.label
                            : `🚚 ${freteInfo.label} — ${formatPrice(freteInfo.cost)}`
                          }
                        </p>
                      )}
                    </div>
                    <div className="form-row">
                      <label htmlFor="shipping_state">Estado</label>
                      <select
                        id="shipping_state"
                        value={form.shipping_state}
                        onChange={e => updateField('shipping_state', e.target.value)}
                        required
                      >
                        <option value="">Selecione</option>
                        {ESTADOS_BR.map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <label htmlFor="shipping_address">Endereço</label>
                    <input
                      id="shipping_address"
                      value={form.shipping_address}
                      onChange={e => updateField('shipping_address', e.target.value)}
                      placeholder="Rua, Avenida..."
                      required
                    />
                  </div>
                  <div className="form-columns">
                    <div className="form-row">
                      <label htmlFor="shipping_number">Número</label>
                      <input
                        id="shipping_number"
                        value={form.shipping_number}
                        onChange={e => updateField('shipping_number', e.target.value)}
                        placeholder="123"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="shipping_complement">Complemento</label>
                      <input
                        id="shipping_complement"
                        value={form.shipping_complement}
                        onChange={e => updateField('shipping_complement', e.target.value)}
                        placeholder="Apto, Bloco..."
                      />
                    </div>
                  </div>
                  <div className="form-columns">
                    <div className="form-row">
                      <label htmlFor="shipping_neighborhood">Bairro</label>
                      <input
                        id="shipping_neighborhood"
                        value={form.shipping_neighborhood}
                        onChange={e => updateField('shipping_neighborhood', e.target.value)}
                        placeholder="Centro"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="shipping_city">Cidade</label>
                      <input
                        id="shipping_city"
                        value={form.shipping_city}
                        onChange={e => updateField('shipping_city', e.target.value)}
                        placeholder="Campina Grande"
                        required
                      />
                    </div>
                  </div>
                  <div className="checkout-nav-buttons">
                    <button type="button" className="button secondary" onClick={() => setStep(1)}>
                      ← Voltar
                    </button>
                    <button type="button" className="button" onClick={handleNextStep}>
                      Continuar para Pagamento →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 3 — Pagamento */}
            {step === 3 && (
              <div className="checkout-section">
                <h2 className="checkout-section-title">💳 Forma de Pagamento</h2>
                <div className="payment-options">
                  <label
                    className={`payment-option ${form.payment_method === 'pix' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="pix"
                      checked={form.payment_method === 'pix'}
                      onChange={e => updateField('payment_method', e.target.value)}
                    />
                    <div className="payment-option-content">
                      <span className="payment-icon">◈</span>
                      <div>
                        <strong>PIX</strong>
                        <p>Pagamento instantâneo via QR Code ou chave PIX. Confirmação imediata.</p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`payment-option ${form.payment_method === 'cartao' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cartao"
                      checked={form.payment_method === 'cartao'}
                      onChange={e => updateField('payment_method', e.target.value)}
                    />
                    <div className="payment-option-content">
                      <span className="payment-icon">▭</span>
                      <div>
                        <strong>Cartão de Crédito</strong>
                        <p>Visa, MasterCard, Elo e outras bandeiras. Parcele em até 3x sem juros.</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Campos interativos do Cartão de Crédito */}
                {form.payment_method === 'cartao' && (
                  <div className="card-fields-box">
                    <h3 style={{ fontSize: '1rem', margin: '0 0 12px' }}>Dados do Cartão</h3>
                    <div className="form-grid">
                      <div className="form-columns">
                        <div className="form-row">
                          <label htmlFor="card_number">Número do Cartão</label>
                          <input
                            id="card_number"
                            value={form.card_number || ''}
                            onChange={e => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                              const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                              updateField('card_number', formatted);
                            }}
                            placeholder="4532 0000 0000 0000"
                            required={form.payment_method === 'cartao'}
                          />
                        </div>
                        <div className="form-row">
                          <label htmlFor="card_brand">Bandeira</label>
                          <select
                            id="card_brand"
                            value={form.card_brand || 'visa'}
                            onChange={e => updateField('card_brand', e.target.value)}
                          >
                            <option value="visa">Visa</option>
                            <option value="mastercard">MasterCard</option>
                            <option value="elo">Elo</option>
                            <option value="hipercard">Hipercard</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <label htmlFor="card_name">Nome Impresso no Cartão</label>
                        <input
                          id="card_name"
                          value={form.card_name || ''}
                          onChange={e => updateField('card_name', e.target.value.toUpperCase())}
                          placeholder="EX: JOAO S SILVA"
                          required={form.payment_method === 'cartao'}
                        />
                      </div>

                      <div className="form-columns">
                        <div className="form-row">
                          <label htmlFor="card_expiry">Validade</label>
                          <input
                            id="card_expiry"
                            value={form.card_expiry || ''}
                            onChange={e => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                              const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                              updateField('card_expiry', formatted);
                            }}
                            placeholder="MM/AA"
                            required={form.payment_method === 'cartao'}
                          />
                        </div>
                        <div className="form-row">
                          <label htmlFor="card_cvv">CVV</label>
                          <input
                            id="card_cvv"
                            value={form.card_cvv || ''}
                            onChange={e => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                              updateField('card_cvv', digits);
                            }}
                            placeholder="123"
                            required={form.payment_method === 'cartao'}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <label htmlFor="card_installments">Parcelamento</label>
                        <select
                          id="card_installments"
                          value={form.card_installments || '1'}
                          onChange={e => updateField('card_installments', e.target.value)}
                        >
                          <option value="1">1x de {formatPrice(grandTotal)} (sem juros)</option>
                          <option value="2">2x de {formatPrice(grandTotal / 2)} (sem juros)</option>
                          <option value="3">3x de {formatPrice(grandTotal / 3)} (sem juros)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="gateway-trust-badge">
                  <span>🔒 Pagamento processado com segurança via Mercado Pago / PagSeguro</span>
                </div>

                <div className="checkout-nav-buttons" style={{ marginTop: '20px' }}>
                  <button type="button" className="button secondary" onClick={() => setStep(2)}>
                    ← Voltar
                  </button>
                  <button
                    type="submit"
                    className="button checkout-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processando...' : `Confirmar Pedido — ${formatPrice(grandTotal)}`}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* RESUMO DO PEDIDO (lateral) */}
        <aside className="checkout-summary">
          <h2>Resumo do Pedido</h2>
          <div className="checkout-summary-items">
            {cart.map(item => (
              <div key={item.id} className="checkout-summary-item">
                {(item.cover_url || item.image) && (
                  <Image
                    src={item.cover_url || item.image}
                    alt=""
                    width={48}
                    height={64}
                    className="checkout-summary-thumb"
                    unoptimized
                  />
                )}
                <div className="checkout-summary-item-info">
                  <span className="checkout-summary-item-title">
                    {item.title || item.name}
                  </span>
                  <span className="checkout-summary-item-qty">
                    {item.quantity}× {formatPrice(item.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-summary-totals">
            <div className="checkout-summary-row">
              <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Frete</span>
              <span>
                {freteInfo
                  ? (freteInfo.cost === 0 ? 'Grátis' : formatPrice(freteInfo.cost))
                  : 'Calcular no passo 2'
                }
              </span>
            </div>
            <div className="checkout-summary-row checkout-summary-total">
              <span>Total</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
