-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "KategoriLaporan" AS ENUM ('AIR', 'LISTRIK', 'WIFI', 'KEBERSIHAN', 'FASILITAS_UMUM', 'LAINNYA');

-- CreateEnum
CREATE TYPE "PrioritasLaporan" AS ENUM ('RENDAH', 'SEDANG', 'TINGGI');

-- CreateEnum
CREATE TYPE "StatusLaporan" AS ENUM ('BARU', 'DIPROSES', 'DIKERJAKAN', 'SELESAI', 'DITOLAK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "nomorKamar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaporanFasilitas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kategori" "KategoriLaporan" NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "prioritas" "PrioritasLaporan" NOT NULL DEFAULT 'SEDANG',
    "status" "StatusLaporan" NOT NULL DEFAULT 'BARU',
    "lokasi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaporanFasilitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "LaporanFasilitas" ADD CONSTRAINT "LaporanFasilitas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
