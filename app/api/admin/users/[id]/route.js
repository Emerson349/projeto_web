import { authorizeApiRequest, unauthorizedResponse, hashPassword } from '@/lib/auth';
import { updateUser, findUserById } from '@/repositories/usersRepository';

export async function PUT(request, { params }) {
  const auth = await authorizeApiRequest(request, ['admin']);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.message, auth.status);
  }

  try {
    const resolvedParams = await params;
    const userId = Number(resolvedParams?.id);
    if (!userId) {
      return Response.json({ message: 'ID de usuário inválido.' }, { status: 400 });
    }

    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return Response.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, role, is_active, password } = body;

    let passwordHash = undefined;
    if (password && password.trim()) {
      passwordHash = await hashPassword(password);
    }

    await updateUser(userId, {
      name,
      email,
      role,
      is_active,
      passwordHash
    });

    return Response.json({ ok: true, message: 'Usuário atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    return Response.json({ message: 'Erro ao atualizar usuário.' }, { status: 500 });
  }
}
