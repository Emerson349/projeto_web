import { POST as authLoginPOST } from '@/app/api/admin/auth/login/route';
import { isValidAdminPassword } from '@/lib/auth';
import { findUserByEmail } from '@/repositories/usersRepository';
import { createSessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  const body = await request.clone().json().catch(() => ({}));

  if (body.email && body.password) {
    return authLoginPOST(request);
  }

  if (isValidAdminPassword(body.password)) {
    const adminUser = await findUserByEmail('admin@compia.com.br');
    const userPayload = {
      id: adminUser?.id || 1,
      name: adminUser?.name || 'Administrador',
      email: adminUser?.email || 'admin@compia.com.br',
      role: 'admin'
    };
    const token = await createSessionToken(userPayload);
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'compia_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return Response.json({ ok: true, user: userPayload, token });
  }

  return Response.json({ message: 'Credenciais inválidas.' }, { status: 401 });
}
