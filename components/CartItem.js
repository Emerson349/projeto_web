'use client';

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';

export default function CartItem({ product }) {
  const {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart
  } = useCart();

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
      }}
    >
      {/* EXIBIÇÃO DA IMAGEM: Verifica se existe cover_url ou image */}
      {(product.cover_url || product.image) && (
        <div style={{ flexShrink: 0 }}>
          <Image 
            src={product.cover_url || product.image} 
            alt={product.title || product.name || 'Capa do livro'} 
            width={80} 
            height={110} 
            style={{ borderRadius: '4px', objectFit: 'cover' }}
            unoptimized
          />
        </div>
      )}

      <div style={{ flex: 1 }}>
        <h3>{product.title || product.name || 'Produto sem título'}</h3>

        {/* Se o autor continuar aparecendo como 'Não informado', significa que você 
          realmente vai precisar adicionar `author: product.author` dentro do objeto do 
          AddToCartButton na página ProductDetailPage.
        */}
        <p style={{ margin: '4px 0', color: '#555' }}>
          Autor: {product.author || 'Não informado'}
        </p>

        <p style={{ margin: '4px 0', fontWeight: '500' }}>
          Preço: R$ {(product.price || 0).toFixed(2)}
        </p>

        <p style={{ margin: '4px 0', color: '#666' }}>
          Quantidade: {product.quantity}
        </p>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '12px'
          }}
        >
          <button 
            onClick={() => decreaseQuantity(product.id)}
            style={{ padding: '2px 8px', cursor: 'pointer' }}
          >
            -
          </button>

          <button 
            onClick={() => increaseQuantity(product.id)}
            style={{ padding: '2px 8px', cursor: 'pointer' }}
          >
            +
          </button>

          <button 
            onClick={() => removeFromCart(product.id)}
            style={{ 
              padding: '2px 8px', 
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
              border: '1px solid #fca5a5', 
              borderRadius: '4px',
              cursor: 'pointer' 
            }}
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}