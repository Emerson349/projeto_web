import { getRequestPassword, isValidAdminPassword, unauthorizedResponse } from '@/lib/auth';
import {
  deleteProduct,
  getProductById,
  updateProduct
} from '@/repositories/productsRepository';

export async function GET(request, { params }) {
  try {
    const product = await getProductById(params.id);

    if (!product) {
      return Response.json({ message: 'Produto não encontrado.' }, { status: 404 });
    }

    return Response.json({ product });
  } catch (error) {
    return Response.json(
      { message: 'Não foi possível carregar o produto.' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  if (!isValidAdminPassword(getRequestPassword(request))) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const product = await updateProduct(params.id, body);

    if (!product) {
      return Response.json({ message: 'Produto não encontrado.' }, { status: 404 });
    }

    return Response.json({ product });
  } catch (error) {
    return Response.json(
      { message: 'Não foi possível atualizar o produto.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  if (!isValidAdminPassword(getRequestPassword(request))) {
    return unauthorizedResponse();
  }

  try {
    const deleted = await deleteProduct(params.id);

    if (!deleted) {
      return Response.json({ message: 'Produto não encontrado.' }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { message: 'Não foi possível excluir o produto.' },
      { status: 500 }
    );
  }
}
