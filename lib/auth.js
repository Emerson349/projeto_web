import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'compia-ecommerce-rbac-jwt-secret-key-2026'
);

export function isValidAdminPassword(password) {
  const adminPass = process.env.ADMIN_PASSWORD || 'aluno001';
  return Boolean(password) && password === adminPass;
}

export function getRequestPassword(request) {
  return request?.headers?.get?.('x-admin-password') || '';
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userPayload) {
  const token = await new SignJWT({
    userId: userPayload.id,
    email: userPayload.email,
    role: userPayload.role,
    name: userPayload.name
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET_KEY);

  return token;
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function getAuthSessionFromRequest(request) {
  // 1. Verificar cookie compia_token
  let token = null;
  if (request && request.cookies && typeof request.cookies.get === 'function') {
    const cookie = request.cookies.get('compia_token');
    token = cookie?.value || cookie;
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('compia_token')?.value;
    } catch (_) {
      // Ignora erro fora do contexto de requisição Next.js
    }
  }

  // 2. Fallback para header Authorization: Bearer <token>
  if (!token && request && request.headers) {
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  return verifySessionToken(token);
}

export async function authorizeApiRequest(request, allowedRoles = ['admin', 'editor', 'vendedor']) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return { authorized: false, status: 401, message: 'Autenticação necessária. Faça login.' };
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return {
      authorized: false,
      status: 403,
      message: `Acesso negado. O perfil '${session.role}' não possui permissão para esta ação.`
    };
  }

  return { authorized: true, session };
}

export function unauthorizedResponse(message = 'Acesso não autorizado.', status = 401) {
  return Response.json({ message }, { status });
}
