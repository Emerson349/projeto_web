import { NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/repositories/ordersRepository';
import { getRequestPassword, isValidAdminPassword, unauthorizedResponse, authorizeApiRequest } from '@/lib/auth';

export async function GET(request) {
  const auth = await authorizeApiRequest(request, ['admin', 'editor', 'vendedor']);
  const reqPass = getRequestPassword(request);
  if (!auth.authorized && !isValidAdminPassword(reqPass)) {
    return unauthorizedResponse(auth.message, auth.status);
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

    // Permite o modo de teste no front-end. O banco usa ENUM('pix','cartao'),
    // então mapeamos 'teste' para 'pix' para evitar erro de truncamento.
    if (body.payment_method === 'teste') {
      body.payment_method = 'pix';
    }

    // Validação básica
    const baseRequired = [
      'customer_name', 'customer_email', 'customer_phone', 'customer_cpf',
      'payment_method', 'items'
    ];

    for (const field of baseRequired) {
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

    // Se todos os itens forem digitais, não exigimos dados de frete
    const hasPhysical = body.items.some(
      (item) => item.format && item.format !== 'digital' && item.format !== 'ebook'
    );

    if (hasPhysical) {
      if (!['entrega', 'retirada'].includes(body.shipping_type)) {
        return NextResponse.json(
          { message: 'Tipo de envio inválido. Escolha entrega ou retirada.' },
          { status: 400 }
        );
      }

      if (body.shipping_type === 'entrega') {
        const shippingRequired = [
          'shipping_cep', 'shipping_address', 'shipping_number',
          'shipping_neighborhood', 'shipping_city', 'shipping_state', 'shipping_method'
        ];

        for (const field of shippingRequired) {
          if (!body[field]) {
            return NextResponse.json(
              { message: `Campo obrigatório de frete ausente: ${field}` },
              { status: 400 }
            );
          }
        }
      } else {
        body.shipping_method = 'retirada';
        body.shipping_cost = 0;
      }
    } else {
      // Padroniza pedido digital
      body.shipping_method = 'digital';
      body.shipping_cost = 0;
      body.shipping_type = 'digital';
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

