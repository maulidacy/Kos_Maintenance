// src/app/api/reports/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/roleGuard';
import {
  updateReportStatusSchema,
  updateReportUserSchema,
} from '@/lib/validation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET detail report
export async function GET(req: NextRequest, context: RouteContext): Promise<Response> {
  try {
    const user = await requireAuth(req);
    const { id: reportId } = await context.params;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID tidak ditemukan.' },
        { status: 400 }
      );
    }

    const report = await prisma.laporanFasilitas.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        judul: true,
        kategori: true,
        prioritas: true,
        status: true,
        lokasi: true,
        deskripsi: true,
        fotoUrl: true,
        createdAt: true,
        updatedAt: true,
        receivedAt: true,
        startedAt: true,
        resolvedAt: true,
        assignedToId: true,
        userId: true,
        user: {
          select: {
            namaLengkap: true,
            nomorKamar: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    // RULE AKSES:
    const isAdmin = user.role === 'ADMIN';
    const isOwner = report.userId === user.id;
    const isAssignedTeknisi =
      user.role === 'TEKNISI' && report.assignedToId === user.id;

    if (!isAdmin && !isOwner && !isAssignedTeknisi) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ report }, { status: 200 });
  } catch (err: unknown) {
    console.error('GET /reports/[id] error:', err);

    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// UPDATE (PUT)
export async function PUT(req: NextRequest, context: RouteContext): Promise<Response> {
  try {
    const user = await requireAuth(req);
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 });
    }

    const existing = await prisma.laporanFasilitas.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    // TEKNISI tidak boleh update report
    if (user.role === 'TEKNISI') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ADMIN: boleh update status saja
    if (user.role === 'ADMIN') {
      const status = (body as { status?: unknown }).status;

      const parsed = updateReportStatusSchema.safeParse({ status });

      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Status tidak valid', details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const updated = await prisma.laporanFasilitas.update({
        where: { id },
        data: { status: parsed.data.status },
      });

      return NextResponse.json({ report: updated }, { status: 200 });
    }

    // USER: hanya laporan miliknya
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // USER tidak boleh update status
    if (Object.prototype.hasOwnProperty.call(body, 'status')) {
      return NextResponse.json(
        { error: 'Pengguna tidak boleh mengubah status laporan.' },
        { status: 403 }
      );
    }

    // USER hanya bisa edit kalau status BARU
    if (existing.status !== 'BARU') {
      return NextResponse.json(
        { error: 'Laporan sudah diproses, tidak bisa diubah lagi.' },
        { status: 400 }
      );
    }

    const parsed = updateReportUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.laporanFasilitas.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ report: updated }, { status: 200 });
  } catch (err: unknown) {
    console.error('PUT /reports/[id] error:', err);

    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH delegasi ke PUT (typing diperjelas agar Next 16 tidak error)
export async function PATCH(req: NextRequest, context: RouteContext): Promise<Response> {
  return PUT(req, context);
}

// DELETE report
export async function DELETE(req: NextRequest, context: RouteContext): Promise<Response> {
  try {
    const user = await requireAuth(req);
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const existing = await prisma.laporanFasilitas.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    // TEKNISI tidak boleh delete report
    if (user.role === 'TEKNISI') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ADMIN boleh hapus semua
    if (user.role === 'ADMIN') {
      await prisma.laporanFasilitas.delete({ where: { id } });
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // USER hanya hapus laporan sendiri
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // USER hanya boleh hapus jika status masih BARU
    if (existing.status !== 'BARU') {
      return NextResponse.json(
        { error: 'Laporan sudah diproses, tidak bisa dihapus.' },
        { status: 400 }
      );
    }

    await prisma.laporanFasilitas.delete({ where: { id } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('DELETE /reports/[id] error:', err);

    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
