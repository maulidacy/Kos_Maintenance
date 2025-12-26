// src/app/api/reports/[id]/reject/route.ts
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
        { error: 'Report ID tidak ditemukan.' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    const note = body?.note as string | undefined;

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      // Reject hanya jika status masih BARU
      const result = await tx.laporanFasilitas.updateMany({
        where: {
          id: reportId,
          status: 'BARU',
        },
        data: { status: 'DITOLAK' },
      });

      if (result.count === 0) {
        const existing = await tx.laporanFasilitas.findUnique({
          where: { id: reportId },
          select: { id: true, status: true },
        });

        if (!existing) return { error: 'NOT_FOUND' as const };
        if (existing.status === 'SELESAI') return { error: 'DONE' as const };
        if (existing.status === 'DITOLAK') return { error: 'ALREADY_REJECTED' as const };
        return { error: 'INVALID_STATUS' as const }; // DIPROSES / DIKERJAKAN
      }

      await tx.laporanEvent.create({
        data: {
          laporanId: reportId,
          actorId: admin.id,
          type: 'STATUS_CHANGED',
          note: note?.trim()
            ? `Admin menolak laporan: ${note.trim()}`
            : 'Admin menolak laporan.',
          at: now,
        },
      });

      const report = await tx.laporanFasilitas.findUnique({
        where: { id: reportId },
        select: { id: true, status: true },
      });

      return { report };
    });

    if ('error' in updated) {
      if (updated.error === 'NOT_FOUND') {
        return NextResponse.json(
          { error: 'Laporan tidak ditemukan.' },
          { status: 404 }
        );
      }
      if (updated.error === 'DONE') {
        return NextResponse.json(
          { error: 'Laporan sudah selesai, tidak bisa ditolak.' },
          { status: 400 }
        );
      }
      if (updated.error === 'INVALID_STATUS') {
        return NextResponse.json(
          { error: 'Reject hanya bisa dilakukan saat laporan masih BARU (belum di-receive).' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Laporan sudah ditolak.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, report: updated.report }, { status: 200 });
  } catch (err: unknown) {
    console.error('Reject report error:', err);

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
