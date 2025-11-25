import { getCurrentUser } from './auth';

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHENTICATED');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return user;
}
