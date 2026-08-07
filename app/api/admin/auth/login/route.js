import { findUserByEmail } from '@/repositories/usersRepository';
import { verifyPassword, createSessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ message: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return Response.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 });
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return Response.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = await createSessionToken(userPayload);

    // Cookie de sessão (sem maxAge fixo para expirar ao fechar o navegador)
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'compia_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return Response.json({
      ok: true,
      user: userPayload,
      token
    });
  } catch (err) {
    console.error('Erro na rota de login:', err);
    return Response.json({ message: 'Erro interno ao realizar login.' }, { status: 500 });
  }
}
