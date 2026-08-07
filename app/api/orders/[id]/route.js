import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/repositories/ordersRepository';
import { getRequestPassword, isValidAdminPassword, unauthorizedResponse } from '@/lib/auth';

function getIdFromRequest(request) {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  return segments[segments.length - 1];
}

export async function GET(request) {
  const id = getIdFromRequest(request);
  
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

export async function PUT(request) {
  const id = getIdFromRequest(request);

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

    // Permitir que o cliente cancele seu pedido pendente informando o mesmo e-mail usado na compra.
    if (status === 'cancelado') {
      const orderCurrent = await getOrderById(id);
      if (!orderCurrent) {
        return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
      }

      const adminOk = isValidAdminPassword(getRequestPassword(request));
      const customerEmail = (body.customer_email || '').trim().toLowerCase();
      const ownerEmail = (orderCurrent.customer_email || '').trim().toLowerCase();

      if (!adminOk) {
        if (!customerEmail || customerEmail !== ownerEmail) {
          return unauthorizedResponse();
        }

        // Só permitimos cancelamento pelo cliente se o pedido ainda estiver pendente
        if (orderCurrent.status !== 'pendente') {
          return NextResponse.json({ message: 'Somente pedidos pendentes podem ser cancelados pelo cliente.' }, { status: 400 });
        }
      }
    } else {
      // Se for alteração administrativa diferente de 'pago' (e não é cancelamento via cliente), exige senha admin
      if (status !== 'pago' && !isValidAdminPassword(getRequestPassword(request))) {
        return unauthorizedResponse();
      }
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
