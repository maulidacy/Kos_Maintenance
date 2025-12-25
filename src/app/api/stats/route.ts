import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaReplica } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roleGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const mode = (req.nextUrl.searchParams.get('mode') || 'weak') as
      | 'strong'
      | 'weak';

    // ✅ PURE WEAK: jika weak tapi replica tidak tersedia → error
    if (mode === 'weak' && !prismaReplica) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Replica belum tersedia (REPLICA_DATABASE_URL belum diset).',
        },
        { status: 400 }
      );
    }

    // ✅ client sesuai mode
    const client = mode === 'strong' ? prisma : prismaReplica!;

    const statuses = ['BARU', 'DIPROSES', 'DIKERJAKAN', 'SELESAI', 'DITOLAK'];

    // ✅ total semua laporan
    const total = await client.laporanFasilitas.count();

    // ✅ hitung per status
    const counts = await Promise.all(
      statuses.map((s) => client.laporanFasilitas.count({ where: { status: s } }))
    );

    // ✅ statistik harian 7 hari terakhir
    const daily = await client.$queryRaw<{ day: string; total: number }[]>`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS total
      FROM "LaporanFasilitas"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY day ASC
    `;

    return NextResponse.json(
      {
        ok: true,
        mode,
        total, // ✅ supaya UI bisa tampil "Total laporan"
        perStatus: {
          BARU: counts[0],
          DIPROSES: counts[1],
          DIKERJAKAN: counts[2],
          SELESAI: counts[3],
          DITOLAK: counts[4],
        },
        perHari: daily,
        meta: {
          consistency: mode === 'weak' ? 'weak (replica)' : 'strong (primary)',
          note:
            mode === 'weak'
              ? 'Data bisa tertinggal / berbeda karena replica adalah eventual consistency.'
              : 'Data real-time dari primary.',
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('GET /api/stats error:', err);

    if (err?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
