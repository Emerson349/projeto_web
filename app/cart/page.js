'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';

export default function CartPage() {
  const {
    cart,
    totalItems,
    totalPrice,
    clearCart
  } = useCart();

  // Estados locais para controlar o CEP e o frete
  const [cep, setCep] = useState('');
  const [frete, setFrete] = useState(0);
  const [erroCep, setErroCep] = useState('');
  const [exibirFrete, setExibirFrete] = useState(false);

  // Função que mascara o input: aceita apenas números e insere o traço automaticamente
  const handleCepChange = (e) => {
    let valor = e.target.value;
    
    // Remove tudo o que não for número
    valor = valor.replace(/\D/g, '');
    
    // Se digitou mais de 5 números, insere o traço: XXXXX-XXX
    if (valor.length > 5) {
      valor = valor.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    
    // Limita o tamanho máximo para 9 caracteres (5 números + 1 traço + 3 números)
    if (valor.length <= 9) {
      setCep(valor);
      // Reseta o cálculo anterior para não confundir o usuário ao digitar um novo CEP
      setFrete(0); 
      setErroCep('');
      setExibirFrete(false);
    }
  };

// Função para calcular o frete (Regra baseada na origem da UFCG - Campina Grande/PB)
  const handleCalcularFrete = () => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      setErroCep('Por favor, insira um CEP válido com 8 dígitos.');
      setFrete(0);
      setExibirFrete(false);
      return;
    }

    setErroCep('');
    
    // Converte os dois primeiros dígitos em NÚMERO inteiro (ex: "01" vira 1)
    const digitoRegiao = parseInt(cepLimpo.substring(0, 2), 10);

    if (digitoRegiao === 58) {
      // CEPs que começam com 58 são da Paraíba (Retirada no Local)
      setFrete(0.00); 
    } else if (
      (digitoRegiao >= 1 && digitoRegiao <= 19) || // São Paulo (01 a 19)
      (digitoRegiao >= 20 && digitoRegiao <= 28) || // Rio de Janeiro (20 a 28)
      (digitoRegiao === 29) ||                       // Espírito Santo (29)
      (digitoRegiao >= 30 && digitoRegiao <= 39)    // Minas Gerais (30 a 39)
    ) {
      // Toda a Região Sudeste mapeada corretamente agora
      setFrete(15.90);
    } else {
      // Demais regiões do Brasil
      setFrete(24.50);
    }

    // Confirma que o cálculo foi realizado com sucesso
    setExibirFrete(true);
  };

  return (
    <section className="page-section" style={{ padding: '40px 20px' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Carrinho</h1>
          <p className="page-description" style={{ color: '#666' }}>
            Confira os produtos adicionados antes de finalizar a compra.
          </p>
        </div>

        {cart.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <>
            {/* Listagem de itens adicionados */}
            <div className="cart-items-list">
              {cart.map((product) => (
                <CartItem
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            {/* Ações do carrinho */}
            <div style={{ marginTop: '15px' }}>
              <button 
                onClick={clearCart} 
                className="btn-secondary" 
                style={{ 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  color: '#dc2626', 
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Limpar Carrinho
              </button>
            </div>

            <hr style={{ margin: '24px 0', borderColor: '#e5e7eb', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

            {/* SEÇÃO DE CÁLCULO DE FRETE */}
            <div className="frete-container" style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px', maxWidth: '400px' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '1rem' }}>Cálculo de Frete</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="00000-000"
                  value={cep}
                  onChange={handleCepChange}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1, fontSize: '1rem' }}
                />
                <button 
                  onClick={handleCalcularFrete} 
                  style={{ padding: '8px 16px', backgroundColor: '#1f2937', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Calcular
                </button>
              </div>
              
              {/* Feedbacks de validação e resultado */}
              {erroCep && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '6px' }}>{erroCep}</p>}
              
              {exibirFrete && !erroCep && (
                <div style={{ marginTop: '10px' }}>
                  {frete > 0 ? (
                    <p style={{ color: '#16a34a', fontSize: '1rem', fontWeight: 'bold' }}>
                      Frete: R$ {frete.toFixed(2)}
                    </p>
                  ) : (
                    <p style={{ color: '#16a34a', fontSize: '1rem', fontWeight: 'bold' }}>
                      Frete Grátis (Retirada na Sede da Editora)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Resumo de Valores */}
            <div className="cart-summary" style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: '#444' }}>Total de itens: {totalItems}</h3>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                Total: R$ {(totalPrice + frete).toFixed(2)}
              </h2>
            </div>

            {/* LINK PARA FINALIZAR COMPRA */}
            <div style={{ marginTop: '32px' }}>
              <Link 
                href="/checkout" 
                style={{ 
                  display: 'inline-block', 
                  backgroundColor: '#115e59', 
                  color: 'white', 
                  padding: '14px 28px', 
                  borderRadius: '6px', 
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                Finalizar Compra [cite: 32]
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}