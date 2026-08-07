import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/repositories/ordersRepository';
import { getRequestPassword, isValidAdminPassword, unauthorizedResponse, authorizeApiRequest } from '@/lib/auth';

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

    const auth = await authorizeApiRequest(request, ['admin', 'vendedor']);
    const isStaff = auth.authorized || isValidAdminPassword(getRequestPassword(request));

    // Permitir que o cliente cancele seu pedido pendente informando o mesmo e-mail usado na compra.
    if (status === 'cancelado') {
      const orderCurrent = await getOrderById(id);
      if (!orderCurrent) {
        return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
      }

      const customerEmail = (body.customer_email || '').trim().toLowerCase();
      const ownerEmail = (orderCurrent.customer_email || '').trim().toLowerCase();

      if (!isStaff) {
        if (!customerEmail || customerEmail !== ownerEmail) {
          return unauthorizedResponse('Operação não autorizada.', 401);
        }

        // Só permitimos cancelamento pelo cliente se o pedido ainda estiver pendente
        if (orderCurrent.status !== 'pendente') {
          return NextResponse.json({ message: 'Somente pedidos pendentes podem ser cancelados pelo cliente.' }, { status: 400 });
        }
      }
    } else {
      // Alterações de status por membros da equipe exigem perfil admin ou vendedor (editor não pode alterar status de pedido)
      if (status !== 'pago' && !isStaff) {
        return unauthorizedResponse('Apenas administradores e vendedores podem alterar o status de pedidos.', 403);
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
