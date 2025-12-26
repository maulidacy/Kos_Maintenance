// src/app/api/admin/teknisi/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roleGuard';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const teknisi = await prisma.user.findMany({
      where: { role: 'TEKNISI' },
      orderBy: { namaLengkap: 'asc' },
      select: {
        id: true,
        namaLengkap: true,
        email: true,
      },
    });

    return NextResponse.json({ teknisi }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : null;

    if (message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.error('GET admin teknisi error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
