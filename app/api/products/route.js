import { getRequestPassword, isValidAdminPassword, unauthorizedResponse } from '@/lib/auth';
import { createProduct, getProducts } from '@/repositories/productsRepository';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  try {
    const products = await getProducts({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      format: searchParams.get('format') || ''
    });

    return Response.json({ products });
  } catch (error) {
    return Response.json(
      { message: 'Não foi possível carregar os produtos.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  if (!isValidAdminPassword(getRequestPassword(request))) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const product = await createProduct(body);
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: 'Não foi possível criar o produto.' },
      { status: 400 }
    );
  }
}
