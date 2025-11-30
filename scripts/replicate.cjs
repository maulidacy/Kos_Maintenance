// scripts/replicate.cjs
// Simple replication: Supabase (primary) -> Neon (replica)

require('dotenv').config(); // load .env

const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL belum di-set di .env');
  process.exit(1);
}

if (!process.env.REPLICA_DATABASE_URL) {
  console.error('❌ REPLICA_DATABASE_URL belum di-set di .env');
  process.exit(1);
}

const primary = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const replica = new PrismaClient({
  datasources: { db: { url: process.env.REPLICA_DATABASE_URL } },
});

async function replicate() {
  console.log('🚀 Starting replication...');

  // 1. Ambil semua user dari primary
  const users = await primary.user.findMany();
  console.log(`👤 Fetched ${users.length} users from primary`);

  // 2. Ambil semua laporan dari primary
  const reports = await primary.laporanFasilitas.findMany();
  console.log(`📄 Fetched ${reports.length} reports from primary`);

  // 3. Tulis ke replica (hapus dulu, lalu isi ulang)
  await replica.$transaction(async (tx) => {
    console.log('🧹 Clearing replica tables...');
    await tx.laporanFasilitas.deleteMany({});
    await tx.user.deleteMany({});

    console.log('✏️ Inserting users into replica...');
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

    console.log('✏️ Inserting reports into replica...');
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

  console.log('✅ Replication completed.');
}

replicate()
  .catch((err) => {
    console.error('❌ Replication failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await primary.$disconnect();
    await replica.$disconnect();
    process.exit(0);
  });
