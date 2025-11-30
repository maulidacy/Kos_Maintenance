// src/lib/roleGuard.ts
import type { NextRequest } from 'next/server';
import { getCurrentUser } from './auth';

export async function requireAuth(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error('UNAUTHENTICATED');
  }
  return user;
}

export async function requireAdmin(req: NextRequest) {
  const user = await requireAuth(req);
  if (user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return user;
}
