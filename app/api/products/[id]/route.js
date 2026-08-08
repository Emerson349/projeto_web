import { NextResponse } from 'next/server';
import { getRequestPassword, isValidAdminPassword, unauthorizedResponse, authorizeApiRequest } from '@/lib/auth';
import {
  deleteProduct,
  getProductById,
  updateProduct
} from '@/repositories/productsRepository';

function getIdFromRequest(request) {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  return segments[segments.length - 1];
}

export async function GET(request) {
  const id = getIdFromRequest(request);

  try {
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { message: 'Não foi possível carregar o produto.' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const auth = await authorizeApiRequest(request, ['admin', 'editor']);
  const reqPass = getRequestPassword(request);
  if (!auth.authorized && !isValidAdminPassword(reqPass)) {
    return unauthorizedResponse(auth.message, auth.status);
  }

  try {
    const id = getIdFromRequest(request);
    const body = await request.json();
    const product = await updateProduct(id, body);

    if (!product) {
      return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { message: 'Não foi possível atualizar o produto.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  const auth = await authorizeApiRequest(request, ['admin', 'editor']);
  const reqPass = getRequestPassword(request);
  if (!auth.authorized && !isValidAdminPassword(reqPass)) {
    return unauthorizedResponse(auth.message, auth.status);
  }

  try {
    const id = getIdFromRequest(request);
    const deleted = await deleteProduct(id);

    if (!deleted) {
      return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Erro comum: tentativa de excluir produto referenciado por `order_items`
    if (error && (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED')) {
      return NextResponse.json(
        { message: 'Produto não pode ser excluído porque há registros relacionados (ex: pedidos).' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Não foi possível excluir o produto.' },
      { status: 500 }
    );
  }
}
