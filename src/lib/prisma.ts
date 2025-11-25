// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // prevent multiple instances of PrismaClient in dev (hot reload)
  // eslint-disable-next-line no-var
  var prismaPrimary: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaReplica: PrismaClient | undefined;
}

const primaryUrl = process.env.DATABASE_URL!;
const replicaUrl = process.env.REPLICA_DATABASE_URL || primaryUrl;

// client ke DB utama (Supabase) – pakai config default dari prisma.config.ts (DATABASE_URL)
export const prisma =
  global.prismaPrimary ??
  new PrismaClient();

// client ke DB replika (Neon) – override URL pakai REPLICA_DATABASE_URL
export const prismaReplica =
  global.prismaReplica ??
  new PrismaClient({
    datasourceUrl: replicaUrl,
  });

if (process.env.NODE_ENV !== 'production') {
  global.prismaPrimary = prisma;
  global.prismaReplica = prismaReplica;
}

export {};
