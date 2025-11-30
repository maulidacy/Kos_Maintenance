// src/app/api/reports/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaReplica } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/roleGuard';
import { createReportSchema } from '@/lib/validation';

// ======================= GET /api/reports =======================
export async function GET(req: NextRequest) {
  try {
    const mode = (req.nextUrl.searchParams.get('mode') || 'strong') as
      | 'strong'
      | 'eventual'
      | 'weak';

    const status = req.nextUrl.searchParams.get('status') || undefined;
    const kategori = req.nextUrl.searchParams.get('kategori') || undefined;
    const isAdminList = req.nextUrl.searchParams.get('admin') === '1';

    // 🔐 auth: kalau admin=1 wajib admin, kalau tidak cukup user biasa
    const user = isAdminList
      ? await requireAdmin(req)
      : await requireAuth(req);

    // 🔁 pilih DB client berdasarkan mode
    const client =
      mode === 'strong'
        ? prisma
        : prismaReplica ?? prisma; // fallback kalau replica belum diset

    const where: any = {};
    if (status) where.status = status;
    if (kategori) where.kategori = kategori;

    // user biasa hanya lihat laporan milik sendiri
    if (!isAdminList) {
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
    if (error?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Reports GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ======================= POST /api/reports =======================
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // 1. Ambil body mentah dulu
    let raw: any = null;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Body tidak valid (bukan JSON)' },
        { status: 400 },
      );
    }

    if (!raw || typeof raw !== 'object') {
      return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 });
    }

    // 2. Jika lokasi kosong → default dari nomorKamar user
    if (
      !raw.lokasi ||
      typeof raw.lokasi !== 'string' ||
      raw.lokasi.trim() === ''
    ) {
      raw.lokasi = user.nomorKamar || 'Tidak diketahui';
    }

    // 3. Validasi dengan Zod
    const parsed = createReportSchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      console.error('Create report validation error:', flat);
      return NextResponse.json(
        { error: 'Invalid input', details: flat },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // 4. Simpan ke DB
    const report = await prisma.laporanFasilitas.create({
      data: {
        userId: user.id,
        kategori: data.kategori,
        judul: data.judul,
        deskripsi: data.deskripsi,
        fotoUrl:
          data.fotoUrl && data.fotoUrl !== '' ? data.fotoUrl : null,
        prioritas: data.prioritas,
        lokasi: data.lokasi,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    console.error('Reports POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
