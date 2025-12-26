// src/app/api/reports/[id]/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/roleGuard';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id: reportId } = await context.params;

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID tidak ditemukan.' }, { status: 400 });
    }

    // pastikan user boleh lihat laporan ini
    const report = await prisma.laporanFasilitas.findUnique({
      where: { id: reportId },
      select: { id: true, userId: true },
    });

    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    // USER hanya boleh lihat laporan miliknya sendiri
    if (user.role === 'USER' && report.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const events = await prisma.laporanEvent.findMany({
      where: { laporanId: reportId },
      orderBy: { at: 'asc' },
      select: {
        id: true,
        type: true,
        note: true,
        at: true,
        actor: {
          select: {
            id: true,
            namaLengkap: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (err: unknown) {
    console.error('GET report events error:', err);

    const message = err instanceof Error ? err.message : null;

    if (message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
