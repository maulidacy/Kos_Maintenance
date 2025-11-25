import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roleGuard';
import { updateReportSchema } from '@/lib/validation';

interface Params {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = updateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    const updated = await prisma.laporanFasilitas.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ report: updated }, { status: 200 });
  } catch (error: any) {
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
