import { isValidAdminPassword } from '@/lib/auth';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  if (!isValidAdminPassword(body.password)) {
    return Response.json({ message: 'Senha inválida.' }, { status: 401 });
  }

  return Response.json({ ok: true });
}
