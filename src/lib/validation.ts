// src/lib/validation.ts
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

// dipakai untuk POST /api/reports
export const createReportSchema = z.object({
  kategori: z.enum([
    'AIR',
    'LISTRIK',
    'WIFI',
    'KEBERSIHAN',
    'FASILITAS_UMUM',
    'LAINNYA',
  ]),
  judul: z.string().min(3, 'Judul minimal 3 karakter').max(200),
  deskripsi: z.string().min(5, 'Deskripsi minimal 5 karakter').max(2000),
  // supaya tidak rewel, boleh kosong / string biasa / URL valid
  fotoUrl: z
    .union([
      z.string().url().max(500),
      z.string().max(500),
      z.literal(''),
      z.undefined(),
    ])
    .optional(),
  prioritas: z.enum(['RENDAH', 'SEDANG', 'TINGGI']),
  lokasi: z.string().min(1, 'Lokasi wajib diisi').max(100),
});

// dipakai untuk PUT /api/reports/[id]
export const updateReportStatusSchema = z.object({
  status: z.enum(['BARU', 'DIPROSES', 'DIKERJAKAN', 'SELESAI', 'DITOLAK']),
});

// Update konten laporan oleh penghuni (tanpa mengubah status)
export const updateReportUserSchema = z.object({
  judul: z.string().min(5).max(200).optional(),
  deskripsi: z.string().min(5, 'Deskripsi minimal 5 karakter').max(2000).optional(),
  fotoUrl: z.string().url().optional().or(z.literal('')),
  prioritas: z.enum(['RENDAH', 'SEDANG', 'TINGGI']).optional(),
  lokasi: z.string().min(1).max(100).optional(),
});

