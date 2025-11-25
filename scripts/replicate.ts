// scripts/replicate.ts
/**
 * Simple replication script from Supabase (primary) to Neon (replica).
 * NOTE: For demo / educational purpose. In production you'd use better change tracking.
 */

import { prisma, prismaReplica } from '../src/lib/prisma';

const primary = prisma;
const replica = prismaReplica;

async function replicate() {
  console.log('Starting replication...');

  // 1. replicate users
  const users = await primary.user.findMany();
  console.log(`Fetched ${users.length} users from primary`);

  // optional: wrap in transaction
  await replica.$transaction(async (tx) => {
    await tx.laporanFasilitas.deleteMany({});
    await tx.user.deleteMany({});

    await tx.user.createMany({
      data: users.map((u) => ({
        id: u.id,
        namaLengkap: u.namaLengkap,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        nomorKamar: u.nomorKamar,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      skipDuplicates: true,
    });

    const reports = await primary.laporanFasilitas.findMany();
    console.log(`Fetched ${reports.length} reports from primary`);

    await tx.laporanFasilitas.createMany({
      data: reports.map((r) => ({
        id: r.id,
        userId: r.userId,
        kategori: r.kategori,
        judul: r.judul,
        deskripsi: r.deskripsi,
        fotoUrl: r.fotoUrl,
        prioritas: r.prioritas,
        status: r.status,
        lokasi: r.lokasi,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      skipDuplicates: true,
    });
  });

  console.log('Replication completed.');
}

replicate()
  .catch((err) => {
    console.error('Replication failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await primary.$disconnect();
    await replica.$disconnect();
    process.exit(0);
  });
