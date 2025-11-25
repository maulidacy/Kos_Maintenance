import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaReplica } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/roleGuard';

export async function GET(req: NextRequest) {
  try {
    const mode = (req.nextUrl.searchParams.get('mode') || 'strong') as
      | 'strong'
      | 'eventual'
      | 'weak';

    const status = req.nextUrl.searchParams.get('status') || undefined;
    const kategori = req.nextUrl.searchParams.get('kategori') || undefined;
    const isAdminList = req.nextUrl.searchParams.get('admin') === '1';

    const user = await (isAdminList ? requireAdmin() : requireAuth());

    // pilih client DB berdasarkan mode
    const client = mode === 'strong' ? prisma : prismaReplica;

    const where: any = {};
    if (status) where.status = status;
    if (kategori) where.kategori = kategori;
    if (!isAdminList) {
      // user biasa hanya boleh lihat laporan miliknya
      where.userId = user.id;
    }

    const reports = await client.laporanFasilitas.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        kategori: true,
        judul: true,
        deskripsi: true,
        fotoUrl: true,
        prioritas: true,
        status: true,
        lokasi: true,
        createdAt: true,
        user: {
          select: {
            namaLengkap: true,
            nomorKamar: true,
          },
        },
      },
    });

    return NextResponse.json({ reports, mode }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { createReportSchema } = await import('@/lib/validation');

    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { kategori, judul, deskripsi, fotoUrl, prioritas, lokasi } =
      parsed.data;

    const report = await prisma.laporanFasilitas.create({
      data: {
        userId: user.id,
        kategori,
        judul,
        deskripsi,
        fotoUrl: fotoUrl || null,
        prioritas,
        lokasi,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
