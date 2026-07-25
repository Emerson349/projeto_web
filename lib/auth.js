export function isValidAdminPassword(password) {
  const adminPass = process.env.ADMIN_PASSWORD || 'change-this-password';
  return Boolean(password) && password === adminPass;
}

export function getRequestPassword(request) {
  return request.headers.get('x-admin-password') || '';
}

export function unauthorizedResponse() {
  return Response.json({ message: 'Acesso administrativo não autorizado.' }, { status: 401 });
}
