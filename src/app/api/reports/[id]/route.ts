// src/app/api/reports/[id]/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/roleGuard';
import {
  updateReportStatusSchema,
  updateReportUserSchema,
} from '@/lib/validation';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ✅ GET /api/reports/[id] – detail laporan
export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const user = await requireAuth(req);
    const { id } = await ctx.params; // ⬅️ penting: await params

    if (!id) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const report = await prisma.laporanFasilitas.findUnique({
      where: { id },
      include: {
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
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 },
      );
    }

    // jika bukan admin, hanya boleh lihat laporan miliknya
    if (user.role !== 'ADMIN' && report.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ report }, { status: 200 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    console.error('Report detail GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ✅ PUT /api/reports/[id]
//  - ADMIN: boleh ubah status + isi
//  - USER: hanya isi, hanya kalau status BARU
export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const user = await requireAuth(req);
    const { id } = await ctx.params; // ⬅️ penting

    if (!id) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Body tidak valid' },
        { status: 400 },
      );
    }

    const existing = await prisma.laporanFasilitas.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 },
      );
    }

    // =============== ADMIN ===============
    if (user.role === 'ADMIN') {
      const updateData: any = {};

      // status
      if (Object.prototype.hasOwnProperty.call(body, 'status')) {
        const parsedStatus = updateReportStatusSchema.safeParse({
          status: body.status,
        });
        if (!parsedStatus.success) {
          const flat = parsedStatus.error.flatten();
          console.error('Update report status validation error (ADMIN):', flat);
          return NextResponse.json(
            { error: 'Invalid status', details: flat },
            { status: 400 },
          );
        }
        updateData.status = parsedStatus.data.status;
      }

      // field lain (judul, deskripsi, dll)
      const { status, ...restFields } = body;
      const parsedUserUpdate = updateReportUserSchema.partial().safeParse(
        restFields,
      );

      if (!parsedUserUpdate.success) {
        const flat = parsedUserUpdate.error.flatten();
        console.error('Update report fields validation error (ADMIN):', flat);
        return NextResponse.json(
          { error: 'Invalid input', details: flat },
          { status: 400 },
        );
      }

      Object.assign(updateData, parsedUserUpdate.data);

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: 'Tidak ada field yang diupdate' },
          { status: 400 },
        );
      }

      const updated = await prisma.laporanFasilitas.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              namaLengkap: true,
              nomorKamar: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({ report: updated }, { status: 200 });
    }

    // =============== USER ===============
    // hanya pemilik
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // user tidak boleh kirim field status
    if (Object.prototype.hasOwnProperty.call(body, 'status')) {
      return NextResponse.json(
        { error: 'Pengguna tidak boleh mengubah status laporan.' },
        { status: 403 },
      );
    }

    // hanya bisa edit kalau status BARU
    if (existing.status !== 'BARU') {
      return NextResponse.json(
        { error: 'Laporan sudah diproses, tidak bisa diubah lagi.' },
        { status: 400 },
      );
    }

    const parsedUserUpdate = updateReportUserSchema.safeParse(body);
    if (!parsedUserUpdate.success) {
      const flat = parsedUserUpdate.error.flatten();
      console.error('Update report user validation error (USER):', flat);
      return NextResponse.json(
        { error: 'Invalid input', details: flat },
        { status: 400 },
      );
    }

    if (Object.keys(parsedUserUpdate.data).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada field yang diupdate' },
        { status: 400 },
      );
    }

    const updated = await prisma.laporanFasilitas.update({
      where: { id },
      data: parsedUserUpdate.data,
      include: {
        user: {
          select: {
            namaLengkap: true,
            nomorKamar: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ report: updated }, { status: 200 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    console.error('Report update PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ✅ PATCH → alias ke PUT
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return PUT(req, ctx);
}

// ✅ DELETE /api/reports/[id] – hapus laporan
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const user = await requireAuth(req);
    const { id } = await ctx.params; // ⬅️ ingat: params adalah Promise

    if (!id) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const existing = await prisma.laporanFasilitas.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 },
      );
    }

    // =============== ADMIN ===============
    if (user.role === 'ADMIN') {
      await prisma.laporanFasilitas.delete({ where: { id } });

      return NextResponse.json(
        { ok: true, message: 'Laporan berhasil dihapus.' },
        { status: 200 },
      );
    }

    // =============== USER (penghuni) ===============
    // hanya boleh hapus laporan sendiri
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // hanya boleh hapus kalau status masih BARU
    if (existing.status !== 'BARU') {
      return NextResponse.json(
        { error: 'Laporan sudah diproses, tidak bisa dihapus.' },
        { status: 400 },
      );
    }

    await prisma.laporanFasilitas.delete({ where: { id } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    console.error('Report DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

