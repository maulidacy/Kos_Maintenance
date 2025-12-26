// src/app/api/teknisi/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTeknisi } from '@/lib/roleGuard';
import { Prisma, StatusLaporan } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const teknisi = await requireTeknisi(req);

    const limitParam = req.nextUrl.searchParams.get('limit');
    const cursor = req.nextUrl.searchParams.get('cursor');

    const limit = Math.min(Number(limitParam || 20), 50);

    // typing diperbaiki tanpa mengubah logic
    const where: Prisma.LaporanFasilitasWhereInput = {
      assignedToId: teknisi.id,
      status: { in: [StatusLaporan.SELESAI, StatusLaporan.DITOLAK] },
    };

    const items = await prisma.laporanFasilitas.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit + 1,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      select: {
        id: true,
        judul: true,
        kategori: true,
        prioritas: true,
        status: true,
        lokasi: true,
        createdAt: true,
        updatedAt: true,
        resolvedAt: true,
        user: {
          select: {
            namaLengkap: true,
            nomorKamar: true,
            email: true,
          },
        },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return NextResponse.json(
      {
        items: data,
        nextCursor,
        hasMore,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('GET /api/teknisi/history error:', err);

    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
