import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'compia-ecommerce-rbac-jwt-secret-key-2026'
);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Apenas intercepta rotas do painel admin
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Permitir página de login
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get('compia_token');
  const token = tokenCookie?.value;

  if (!token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    const role = payload?.role;

    // Regras de acesso por rota (RBAC)
    if (pathname.startsWith('/admin/usuarios') && role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/pedidos?error=unauthorized', request.url));
    }

    if ((pathname.startsWith('/admin/produtos/novo') || pathname.includes('/editar')) && !['admin', 'editor'].includes(role)) {
      return NextResponse.redirect(new URL('/admin/produtos?error=unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/admin/:path*']
};
