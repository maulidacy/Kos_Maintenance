import { z } from 'zod';

export const registerSchema = z.object({
  namaLengkap: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  nomorKamar: z.string().max(20).optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createReportSchema = z.object({
  kategori: z.enum(['AIR', 'LISTRIK', 'WIFI', 'KEBERSIHAN', 'FASILITAS_UMUM', 'LAINNYA']),
  judul: z.string().min(5).max(200),
  deskripsi: z.string().min(10).max(2000),
  fotoUrl: z.string().url().optional().or(z.literal('')),
  prioritas: z.enum(['RENDAH', 'SEDANG', 'TINGGI']),
  lokasi: z.string().min(1).max(100),
});

export const updateReportSchema = z.object({
  status: z.enum(['BARU', 'DIPROSES', 'DIKERJAKAN', 'SELESAI', 'DITOLAK']),
});
