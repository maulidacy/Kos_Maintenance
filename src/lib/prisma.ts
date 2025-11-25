// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaReplica?: PrismaClient;
};

// Client ke database utama (Supabase) → pakai DATABASE_URL dari .env / prisma.config.ts
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

// Client ke database replika (Neon) → override pakai REPLICA_DATABASE_URL
export const prismaReplica =
  globalForPrisma.prismaReplica ??
  new PrismaClient({
    datasourceUrl: process.env.REPLICA_DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaReplica = prismaReplica;
}
