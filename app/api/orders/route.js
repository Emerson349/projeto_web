import { NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/repositories/ordersRepository';
import { getRequestPassword, isValidAdminPassword, unauthorizedResponse } from '@/lib/auth';

export async function GET(request) {
  if (!isValidAdminPassword(getRequestPassword(request))) {
    return unauthorizedResponse();
  }

  try {
    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { message: 'Não foi possível carregar os pedidos.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validação básica
    const required = [
      'customer_name', 'customer_email', 'customer_phone', 'customer_cpf',
      'shipping_cep', 'shipping_address', 'shipping_number',
      'shipping_neighborhood', 'shipping_city', 'shipping_state',
      'shipping_method', 'payment_method', 'items'
    ];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Campo obrigatório ausente: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { message: 'O pedido precisa ter pelo menos um item.' },
        { status: 400 }
      );
    }

    // Calcula totais
    const subtotal = body.items.reduce(
      (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
      0
    );
    const shippingCost = Number(body.shipping_cost) || 0;
    const total = subtotal + shippingCost;

    const orderData = {
      ...body,
      subtotal,
      shipping_cost: shippingCost,
      total,
    };

    const order = await createOrder(orderData);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json(
      { message: 'Não foi possível criar o pedido.', detalhe: error.message },
      { status: 500 }
    );
  }
}

