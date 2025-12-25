// src/app/api/admin/timetime/details/route.ts
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

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    // ✅ params tanggal
    const fromParam = req.nextUrl.searchParams.get('from');
    const toParam = req.nextUrl.searchParams.get('to');

    const from = parseDateOnly(fromParam);
    const to = parseDateOnly(toParam);

    // default range: 7 hari terakhir (UTC)
    const now = new Date();
    const defaultTo = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );
    const defaultFrom = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6)
    );

    const timeFrom = from ?? defaultFrom;
    const timeTo = to
      ? new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate() + 1))
      : defaultTo;

    // ✅ pagination
    const pageParam = req.nextUrl.searchParams.get('page');
    const limitParam = req.nextUrl.searchParams.get('limit');

    const page = Math.max(parseInt(pageParam || '1', 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(limitParam || '10', 10) || 10, 5), 50);
    const skip = (page - 1) * limit;

    const where = {
      createdAt: { gte: timeFrom, lt: timeTo },
    };

    // ✅ total untuk pagination
    const total = await prisma.laporanFasilitas.count({ where });

    // ✅ ambil data detail
    const reports = await prisma.laporanFasilitas.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        judul: true,
        status: true,
        createdAt: true,
        receivedAt: true,
        startedAt: true,
        resolvedAt: true,
      },
    });

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return NextResponse.json(
      {
        ok: true,
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('GET /api/admin/timetime/details error:', err);

    if (err?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
