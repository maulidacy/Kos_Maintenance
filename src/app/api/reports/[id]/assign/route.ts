// src/app/api/reports/[id]/assign/route.ts
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

    const body = await req.json().catch(() => null);
    const teknisiId = body?.teknisiId as string | undefined;

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID tidak ditemukan.' }, { status: 400 });
    }

    if (!teknisiId) {
      return NextResponse.json({ error: 'teknisiId wajib diisi.' }, { status: 400 });
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      // validasi teknisi di dalam transaksi agar konsisten
      const teknisi = await tx.user.findUnique({
        where: { id: teknisiId },
        select: { id: true, role: true },
      });

      if (!teknisi || teknisi.role !== 'TEKNISI') {
        return { error: 'INVALID_TEKNISI' as const };
      }

      const result = await tx.laporanFasilitas.updateMany({
        where: { id: reportId, status: 'DIPROSES' },
        data: { assignedToId: teknisiId },
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
          type: 'ASSIGNED',
          note: `Admin assign teknisi (${teknisiId}).`,
          at: now,
        },
      });

      const report = await tx.laporanFasilitas.findUnique({
        where: { id: reportId },
        select: { id: true, status: true, assignedToId: true },
      });

      return { report };
    });

    if ('error' in updated) {
      if (updated.error === 'INVALID_TEKNISI') {
        return NextResponse.json({ error: 'Teknisi tidak valid.' }, { status: 400 });
      }
      if (updated.error === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Assign hanya bisa saat status DIPROSES.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, report: updated.report }, { status: 200 });
  } catch (err: unknown) {
    console.error('Assign report error:', err);

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
