// src/app/reports/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

type CreateReportResponse = {
  error?: string;
  details?: unknown;
  report?: unknown;
};

export default function NewReportPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    kategori: 'AIR',
    judul: '',
    deskripsi: '',      // JANGAN pakai deskripsi.trim() di sini
    fotoUrl: '',
    prioritas: 'SEDANG',
    lokasi: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Trim dulu sebelum dikirim ke API
    const payload = {
      kategori: form.kategori,
      judul: form.judul.trim(),
      deskripsi: form.deskripsi.trim(),
      fotoUrl: form.fotoUrl.trim() || undefined,
      prioritas: form.prioritas,
      lokasi: form.lokasi.trim(),
    };

    // Validasi cepat di sisi client biar user dapat pesan jelas
    if (payload.deskripsi.length < 5) {
      setIsSubmitting(false);
      setError('Deskripsi minimal 5 karakter (setelah spasi di depan/belakang dihapus).');
      return;
    }

    try {
      // Debug optional: lihat apa yang dikirim
      console.log('Create report payload:', payload);

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: CreateReportResponse | null = null;
      try {
        data = await res.json();
      } catch {
        console.error('Response bukan JSON, status:', res.status);
        setError('Terjadi kesalahan server (respon bukan JSON).');
        return;
      }

      if (!res.ok) {
        console.error('Create report error data:', data);
        setError(data?.error || 'Input tidak valid, periksa kembali form.');
        return;
      }

      // sukses → arahkan ke halaman daftar laporan
      router.push('/reports');
    } catch (err) {
      console.error('Create report network error:', err);
      setError('Terjadi kesalahan jaringan. Coba lagi nanti.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-start">
        {/* kiri: info */}
        <section className="flex-1 space-y-4">
          <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100">
            FORM LAPORAN FASILITAS
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Buat laporan{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              fasilitas kos
            </span>
          </h1>
          <p className="max-w-md text-sm md:text-base text-slate-300">
            Jelaskan masalah secara singkat dan jelas. Admin akan menindaklanjuti
            berdasarkan prioritas dan kategori laporan.
          </p>
          <Link
            href="/reports"
            className="inline-flex text-xs text-emerald-300 hover:text-emerald-200"
          >
            Kembali ke daftar laporan
          </Link>
        </section>

        {/* kanan: form */}
        <section className="flex-1">
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-emerald-500/20 backdrop-blur">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Judul */}
              <div>
                <label className="block text-xs font-medium text-slate-200">
                  Judul laporan
                </label>
                <input
                  name="judul"
                  type="text"
                  required
                  value={form.judul}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                  placeholder="Contoh: Air kamar mandi tidak mengalir"
                />
              </div>

              {/* Kategori & Prioritas */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-200">
                    Kategori
                  </label>
                  <select
                    name="kategori"
                    value={form.kategori}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                  >
                    <option value="AIR">Air</option>
                    <option value="LISTRIK">Listrik</option>
                    <option value="WIFI">WiFi</option>
                    <option value="KEBERSIHAN">Kebersihan</option>
                    <option value="FASILITAS_UMUM">Fasilitas Umum</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200">
                    Prioritas
                  </label>
                  <select
                    name="prioritas"
                    value={form.prioritas}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                  >
                    <option value="RENDAH">Rendah</option>
                    <option value="SEDANG">Sedang</option>
                    <option value="TINGGI">Tinggi</option>
                  </select>
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-xs font-medium text-slate-200">
                  Lokasi / Nomor kamar
                </label>
                <input
                  name="lokasi"
                  type="text"
                  required
                  value={form.lokasi}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                  placeholder="Misal: Kamar A-02, Lantai 2"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-medium text-slate-200">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  required
                  rows={4}
                  value={form.deskripsi}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                  placeholder="Ceritakan kronologi singkat masalah, sejak kapan terjadi, dan seberapa mengganggu."
                />
              </div>

              {/* Foto URL (opsional) */}
              <div>
                <label className="block text-xs font-medium text-slate-200">
                  URL Foto (opsional)
                </label>
                <input
                  name="fotoUrl"
                  type="url"
                  value={form.fotoUrl}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                  placeholder="https://contoh.com/foto-masalah.jpg"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:bg-emerald-500/60"
              >
                {isSubmitting ? 'Mengirim laporan...' : 'Kirim laporan'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
