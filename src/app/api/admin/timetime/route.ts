// src/app/api/admin/timetime/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roleGuard';

export const runtime = 'nodejs';

function parseDateOnly(value: string | null) {
  if (!value) return null;
  const v = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function msToMinutes(ms: number) {
  return Math.floor(ms / 60000);
}

function safeAvg(totalMs: number, count: number) {
  if (!count) return 0;
  return Math.round(totalMs / count);
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const fromParam = req.nextUrl.searchParams.get('from');
    const toParam = req.nextUrl.searchParams.get('to');

    const from = parseDateOnly(fromParam);
    const to = parseDateOnly(toParam);

    // default range: 7 hari terakhir (UTC) untuk ringan
    const now = new Date();
    const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6));

    const timeFrom = from ?? defaultFrom;
    const timeTo = to
      ? new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate() + 1))
      : defaultTo;

    // limit param biar tidak berat (default 50)
    const limitParam = req.nextUrl.searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '50', 10) || 50, 10), 200);

    // Ambil laporan + timestamps + judul
    const rows = await prisma.laporanFasilitas.findMany({
      where: {
        createdAt: { gte: timeFrom, lt: timeTo },
      },
      select: {
        id: true,
        judul: true,
        status: true,
        createdAt: true,
        receivedAt: true,
        startedAt: true,
        resolvedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const summary = {
      range: {
        from: timeFrom.toISOString(),
        to: timeTo.toISOString(),
      },
      total: rows.length,
      finished: 0,
      rejected: 0,
      received: 0,
      inProgress: 0,
      avgResponseMs: 0,
      avgWorkMs: 0,
      avgTotalMs: 0,
    };

    let responseCount = 0;
    let workCount = 0;
    let totalCount = 0;

    let responseSum = 0;
    let workSum = 0;
    let totalSum = 0;

    for (const r of rows) {
      if (r.status === 'SELESAI') summary.finished += 1;
      if (r.status === 'DITOLAK') summary.rejected += 1;
      if (r.status === 'DIKERJAKAN') summary.inProgress += 1;
      if (r.receivedAt) summary.received += 1;

      if (r.receivedAt) {
        const diff = r.receivedAt.getTime() - r.createdAt.getTime();
        if (diff >= 0) {
          responseSum += diff;
          responseCount += 1;
        }
      }

      if (r.startedAt && r.resolvedAt) {
        const diff = r.resolvedAt.getTime() - r.startedAt.getTime();
        if (diff >= 0) {
          workSum += diff;
          workCount += 1;
        }
      }

      if (r.resolvedAt) {
        const diff = r.resolvedAt.getTime() - r.createdAt.getTime();
        if (diff >= 0) {
          totalSum += diff;
          totalCount += 1;
        }
      }
    }

    summary.avgResponseMs = safeAvg(responseSum, responseCount);
    summary.avgWorkMs = safeAvg(workSum, workCount);
    summary.avgTotalMs = safeAvg(totalSum, totalCount);

    // RETURN reports + summary supaya UI tetap jalan
    return NextResponse.json(
      {
        ok: true,
        reports: rows,
        summary,
        human: {
          avgResponseMin: msToMinutes(summary.avgResponseMs),
          avgWorkMin: msToMinutes(summary.avgWorkMs),
          avgTotalMin: msToMinutes(summary.avgTotalMs),
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('GET /api/admin/timetime error:', err);

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
