export function isValidAdminPassword(password) {
  return Boolean(process.env.ADMIN_PASSWORD) && password === process.env.ADMIN_PASSWORD;
}

export function getRequestPassword(request) {
  return request.headers.get('x-admin-password') || '';
}

export function unauthorizedResponse() {
  return Response.json({ message: 'Acesso administrativo não autorizado.' }, { status: 401 });
}
