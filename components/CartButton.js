'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function CartButton() {
  const { totalItems } = useCart(); // Pega a quantidade direto do seu contexto global

  return (
    <Link href="/cart" className="cart-link" aria-label={`Ver carrinho com ${totalItems} itens`}>
      <div className="cart-icon-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="22" 
          height="22" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>

        {/* O número muda sozinho, seja adicionando na Home ou alterando na página /cart */}
        {totalItems > 0 && (
          <span className="cart-badge">{totalItems}</span>
        )}
      </div>
    </Link>
  );
}