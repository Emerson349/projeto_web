import { getAllCategories } from '@/repositories/categoriesRepository';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return Response.json({ categories });
  } catch (error) {
    return Response.json(
      { message: 'Não foi possível carregar as categorias.' },
      { status: 500 }
    );
  }
}
