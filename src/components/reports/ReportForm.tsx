// src/components/reports/ReportForm.tsx
'use client';

import React, { useState } from 'react';

type ReportFormProps = {
  onSubmit: (data: {
    kategori: string;
    judul: string;
    deskripsi: string;
    fotoUrl?: string;
    prioritas: string;
    lokasi: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
};

export function ReportForm({ onSubmit, isSubmitting }: ReportFormProps) {
  const [form, setForm] = useState({
    kategori: 'AIR',
    judul: '',
    deskripsi: '',
    fotoUrl: '',
    prioritas: 'SEDANG',
    lokasi: '',
  });

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
    await onSubmit({
      ...form,
      fotoUrl: form.fotoUrl || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/70"
    >
      <div>
        <label
          htmlFor="judul"
          className="block text-xs font-medium text-slate-200"
        >
          Judul Laporan
        </label>
        <input
          id="judul"
          name="judul"
          type="text"
          required
          value={form.judul}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          placeholder="Contoh: Air tidak mengalir di kamar mandi"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="kategori"
            className="block text-xs font-medium text-slate-200"
          >
            Kategori
          </label>
          <select
            id="kategori"
            name="kategori"
            value={form.kategori}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="AIR">Air</option>
            <option value="LISTRIK">Listrik</option>
            <option value="WIFI">WiFi</option>
            <option value="KEBERSIHAN">Kebersihan</option>
            <option value="FASILITAS_UMUM">Fasilitas umum</option>
            <option value="LAINNYA">Lainnya</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="prioritas"
            className="block text-xs font-medium text-slate-200"
          >
            Prioritas
          </label>
          <select
            id="prioritas"
            name="prioritas"
            value={form.prioritas}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="RENDAH">Rendah</option>
            <option value="SEDANG">Sedang</option>
            <option value="TINGGI">Tinggi</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="lokasi"
          className="block text-xs font-medium text-slate-200"
        >
          Lokasi/Nomor Kamar
        </label>
        <input
          id="lokasi"
          name="lokasi"
          type="text"
          required
          value={form.lokasi}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          placeholder="Contoh: Kamar B-12/Dapur lantai 2"
        />
      </div>

      <div>
        <label
          htmlFor="deskripsi"
          className="block text-xs font-medium text-slate-200"
        >
          Deskripsi
        </label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          required
          rows={4}
          value={form.deskripsi}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          placeholder="Ceritakan detail masalahnya, misalnya sejak kapan terjadi, seberapa parah, dll."
        />
      </div>

      <div>
        <label
          htmlFor="fotoUrl"
          className="block text-xs font-medium text-slate-200"
        >
          URL Foto (opsional)
        </label>
        <input
          id="fotoUrl"
          name="fotoUrl"
          type="url"
          value={form.fotoUrl}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          placeholder="https://..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-600/60"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </div>
    </form>
  );
}
