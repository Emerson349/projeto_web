import { authorizeApiRequest, unauthorizedResponse, hashPassword } from '@/lib/auth';
import { listUsers, createUser, findUserByEmail } from '@/repositories/usersRepository';

export async function GET(request) {
  const auth = await authorizeApiRequest(request, ['admin']);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.message, auth.status);
  }

  try {
    const users = await listUsers();
    return Response.json(users);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    return Response.json({ message: 'Erro interno ao listar usuários.' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await authorizeApiRequest(request, ['admin']);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.message, auth.status);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return Response.json({ message: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return Response.json({ message: 'Já existe um usuário cadastrado com este e-mail.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const userId = await createUser({
      name,
      email,
      passwordHash,
      role: role || 'editor'
    });

    return Response.json({ ok: true, id: userId, message: 'Usuário criado com sucesso!' }, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    return Response.json({ message: 'Erro ao criar usuário.' }, { status: 500 });
  }
}
