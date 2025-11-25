'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const features = [
    {
      title: 'Laporkan Cepat',
      desc: 'Penghuni dapat membuat laporan hanya dalam beberapa klik, lengkap dengan prioritas dan lokasi kamar.',
    },
    {
      title: 'Pantau Status',
      desc: 'Admin dapat mengubah status laporan: baru, diproses, dikerjakan, selesai, atau ditolak.',
    },
    {
      title: 'Mode Konsistensi',
      desc: 'Strong (Supabase), eventual & weak consistency (Neon) untuk laporan & statistik.',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background gradient statis */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#4f46e5_0%,_#020617_60%)] opacity-80" />

      {/* Glow lembut kiri-atas */}
      <div className="soft-glow absolute -top-40 -left-32 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
      {/* Glow lembut kanan-bawah */}
      <div className="soft-glow absolute bottom-[-80px] right-[-40px] h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center">
        {/* Header */}
        <header
          className={`space-y-4 transition-all duration-900 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <p className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">
            Sistem Pelaporan Fasilitas Kos
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 to-sky-300 bg-clip-text text-transparent drop-shadow">
            Kos Maintenance & Complaint System
          </h1>

          <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-300 leading-relaxed">
            Laporkan masalah air, listrik, WiFi, kebersihan, dan fasilitas umum
            dengan cepat. Admin dapat memantau dan mengelola status laporan
            secara realtime.
          </p>
        </header>

        {/* CTA Buttons */}
        <div
          className={`mt-8 flex flex-col sm:flex-row gap-3 transition-all duration-900 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: mounted ? '120ms' : '0ms' }}
        >
          <Link
            href="/login"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            Masuk Penghuni / Admin
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-indigo-300/30 bg-white/10 backdrop-blur px-6 py-3 font-semibold text-indigo-200 shadow-lg hover:bg-white/20 active:scale-[0.98] transition-all"
          >
            Daftar Penghuni Baru
          </Link>
        </div>

        {/* Feature cards */}
        <section className="grid w-full gap-4 md:grid-cols-3 mt-12 px-2 md:px-4">
          {features.map((item, i) => (
            <div
              key={item.title}
              className={`rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-xl backdrop-blur transform transition-all duration-900 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              } hover:-translate-y-1 hover:shadow-indigo-500/20`}
              style={{ transitionDelay: mounted ? `${200 + i * 130}ms` : '0ms' }}
            >
              <h2 className="text-lg font-semibold text-indigo-200">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
