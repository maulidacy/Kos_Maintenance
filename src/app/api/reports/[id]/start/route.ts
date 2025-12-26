// src/app/api/reports/[id]/start/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTeknisi } from '@/lib/roleGuard';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const teknisi = await requireTeknisi(req);
    const { id: reportId } = await context.params;

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID tidak ditemukan.' }, { status: 400 });
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.laporanFasilitas.updateMany({
        where: { id: reportId, status: 'DIPROSES', assignedToId: teknisi.id },
        data: {
          status: 'DIKERJAKAN',
          startedAt: now,
        },
      });

      if (result.count === 0) {
        const existing = await tx.laporanFasilitas.findUnique({
          where: { id: reportId },
          select: { id: true, status: true, assignedToId: true },
        });

        if (!existing) return { error: 'NOT_FOUND' as const };
        if (existing.assignedToId !== teknisi.id) return { error: 'FORBIDDEN' as const };
        return { error: 'INVALID_STATUS' as const };
      }

      await tx.laporanEvent.create({
        data: {
          laporanId: reportId,
          actorId: teknisi.id,
          type: 'STARTED',
          note: 'Teknisi memulai pengerjaan.',
          at: now,
        },
      });

      const report = await tx.laporanFasilitas.findUnique({
        where: { id: reportId },
        select: { id: true, status: true, startedAt: true },
      });

      return { report };
    });

    if ('error' in updated) {
      if (updated.error === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
      }
      if (updated.error === 'FORBIDDEN') {
        return NextResponse.json({ error: 'Laporan ini bukan tugas kamu.' }, { status: 403 });
      }
      return NextResponse.json(
        { error: 'Start hanya bisa saat status DIPROSES.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, report: updated.report }, { status: 200 });
  } catch (err: unknown) {
    console.error('Start report error:', err);

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
