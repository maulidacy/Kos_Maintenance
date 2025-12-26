// src/app/teknisi/reports/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTeknisi } from '@/lib/roleGuard';

export async function GET(req: NextRequest) {
  try {
    const teknisi = await requireTeknisi(req);

    const reports = await prisma.laporanFasilitas.findMany({
      where: { assignedToId: teknisi.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        judul: true,
        kategori: true,
        prioritas: true,
        status: true,
        lokasi: true,
        createdAt: true,
        receivedAt: true,
        startedAt: true,
        resolvedAt: true,
      },
    });

    return NextResponse.json({ reports }, { status: 200 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHENTICATED')
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    if (error?.message === 'FORBIDDEN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    console.error('Teknisi reports GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
