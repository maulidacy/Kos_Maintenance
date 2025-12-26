import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roleGuard';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { id: reportId } = await context.params;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID tidak ditemukan di params.' },
        { status: 400 }
      );
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.laporanFasilitas.updateMany({
        where: { id: reportId, status: 'BARU' },
        data: {
          status: 'DIPROSES',
          receivedAt: now,
        },
      });

      if (result.count === 0) {
        const existing = await tx.laporanFasilitas.findUnique({
          where: { id: reportId },
          select: { id: true, status: true },
        });

        if (!existing) return { error: 'NOT_FOUND' as const };
        return { error: 'INVALID_STATUS' as const };
      }

      await tx.laporanEvent.create({
        data: {
          laporanId: reportId,
          actorId: admin.id,
          type: 'RECEIVED',
          note: 'Admin menerima laporan.',
          at: now,
        },
      });

      const report = await tx.laporanFasilitas.findUnique({
        where: { id: reportId },
        select: { id: true, status: true, receivedAt: true },
      });

      return { report };
    });

    if ('error' in updated) {
      if (updated.error === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Laporan sudah diproses, tidak bisa di-receive lagi.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, report: updated.report }, { status: 200 });
  } catch (err: unknown) {
    console.error('Receive report error:', err);

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
