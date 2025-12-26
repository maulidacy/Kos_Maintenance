// src/app/api/admin/replica-check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaReplica } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roleGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    type ReplicaCheckResult = {
      replicaEnvExists: boolean;
      replicaClientExists: boolean;
      primary: number | null;
      replica: number | null;
    };

    const result: ReplicaCheckResult = {
      replicaEnvExists: Boolean(process.env.REPLICA_DATABASE_URL),
      replicaClientExists: Boolean(prismaReplica),
      primary: null,
      replica: null,
    };

    // primary check
    result.primary = await prisma.laporanFasilitas.count();

    // replica check
    if (prismaReplica) {
      result.replica = await prismaReplica.laporanFasilitas.count();
    }

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err: unknown) {
    console.error('replica-check error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
