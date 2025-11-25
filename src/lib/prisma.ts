import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaReplica?: PrismaClient;
};

// Primary DB (Supabase) – pakai DATABASE_URL dari env / prisma.config
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

// Replica DB (Neon) – override pakai REPLICA_DATABASE_URL
export const prismaReplica =
  globalForPrisma.prismaReplica ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.REPLICA_DATABASE_URL || process.env.DATABASE_URL!,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaReplica = prismaReplica;
}
