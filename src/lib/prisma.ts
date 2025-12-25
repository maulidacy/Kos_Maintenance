// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaReplica: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL! } },
  });

// Replica optional supaya tidak crash kalau env belum diset
const replicaUrl = process.env.REPLICA_DATABASE_URL;

export const prismaReplica =
  replicaUrl
    ? globalForPrisma.prismaReplica ??
      new PrismaClient({
        datasources: { db: { url: replicaUrl } },
      })
    : undefined;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  if (prismaReplica) globalForPrisma.prismaReplica = prismaReplica;
}
