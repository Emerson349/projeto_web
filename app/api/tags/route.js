import { getAllTags } from '@/repositories/tagsRepository';

export async function GET() {
  try {
    const tags = await getAllTags();
    return Response.json({ tags });
  } catch (error) {
    return Response.json(
      { message: 'Não foi possível carregar as tags.' },
      { status: 500 }
    );
  }
}
