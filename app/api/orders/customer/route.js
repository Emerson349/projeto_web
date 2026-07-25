import { NextResponse } from 'next/server';
import { getOrdersByEmail } from '@/repositories/ordersRepository';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email || !email.trim()) {
    return NextResponse.json(
      { message: 'E-mail é obrigatório para consultar os pedidos.' },
      { status: 400 }
    );
  }

  try {
    const orders = await getOrdersByEmail(email);
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { message: 'Não foi possível buscar os pedidos.' },
      { status: 500 }
    );
  }
}
