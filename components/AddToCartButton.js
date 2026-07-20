'use client';

import { useCart } from '@/contexts/CartContext';

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      className="btn btn-primary"
    >
      Adicionar ao carrinho
    </button>
  );
}