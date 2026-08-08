import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('compia_token');
  cookieStore.set({
    name: 'compia_token',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
    path: '/'
  });

  return Response.json({ ok: true, message: 'Logout realizado com sucesso.' });
}

export async function GET() {
  return POST();
}
