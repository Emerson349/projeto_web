import { getAuthSessionFromRequest, unauthorizedResponse } from '@/lib/auth';
import { findUserById } from '@/repositories/usersRepository';

export async function GET(request) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return unauthorizedResponse('Sessão expirada ou inválida.', 401);
  }

  const user = await findUserById(session.userId);
  if (!user || !user.is_active) {
    return unauthorizedResponse('Usuário inativo ou não encontrado.', 401);
  }

  return Response.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: Boolean(user.is_active)
    }
  });
}
