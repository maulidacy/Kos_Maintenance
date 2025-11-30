import { z } from 'zod';

// ==================================================
// REGISTER
// ==================================================
export const registerSchema = z.object({
  namaLengkap: z.string().trim().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  nomorKamar: z.string().trim().max(20).optional().or(z.literal('')),
});

// ==================================================
// LOGIN
// ==================================================
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// ==================================================
// CREATE REPORT  (USER membuat laporan baru)
// ==================================================
export const createReportSchema = z.object({
  kategori: z.enum([
    'AIR',
    'LISTRIK',
    'WIFI',
    'KEBERSIHAN',
    'FASILITAS_UMUM',
    'LAINNYA',
  ]),

  judul: z
    .string()
    .trim()
    .min(3, 'Judul minimal 3 karakter')
    .max(200),

  deskripsi: z
    .string()
    .trim()
    .min(5, 'Deskripsi minimal 5 karakter')
    .max(2000),

  fotoUrl: z
    .string()
    .trim()
    .url()
    .max(500)
    .optional()
    .or(z.literal('')),

  prioritas: z.enum(['RENDAH', 'SEDANG', 'TINGGI']),

  lokasi: z
    .string()
    .trim()
    .min(1, 'Lokasi wajib diisi')
    .max(100),
});

// ==================================================
// UPDATE STATUS (ADMIN)
// ==================================================
export const updateReportStatusSchema = z.object({
  status: z.enum(['BARU', 'DIPROSES', 'DIKERJAKAN', 'SELESAI', 'DITOLAK']),
});

// ==================================================
// UPDATE REPORT (USER) — tanpa status
// ==================================================
export const updateReportUserSchema = z.object({
  judul: z.string().trim().min(3).max(200).optional(),

  deskripsi: z
    .string()
    .trim()
    .min(5, 'Deskripsi minimal 5 karakter')
    .max(2000)
    .optional(),

  fotoUrl: z
    .string()
    .trim()
    .url()
    .max(500)
    .optional()
    .or(z.literal('')),

  prioritas: z.enum(['RENDAH', 'SEDANG', 'TINGGI']).optional(),

  lokasi: z.string().trim().min(1).max(100).optional(),
});
