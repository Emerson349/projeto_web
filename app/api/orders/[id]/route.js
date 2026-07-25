import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/repositories/ordersRepository';
import { getRequestPassword, isValidAdminPassword, unauthorizedResponse } from '@/lib/auth';

export async function GET(request, { params }) {
  const { id } = await params;
  
  try {
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { message: 'Não foi possível carregar o pedido.' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  if (!isValidAdminPassword(getRequestPassword(request))) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Status de pedido inválido.' },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(id, status);
    
    if (!order) {
      return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { message: 'Não foi possível atualizar o pedido.' },
      { status: 500 }
    );
  }
}
