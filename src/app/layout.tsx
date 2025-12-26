// src/app/layout.tsx
import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Kos Maintenance & Complaint System',
  description: 'Sistem pelaporan fasilitas kos',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        {/* BACKGROUND GLOBAL: sama untuk semua halaman */}
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />

        {/* KONTEN */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/*
            <Navbar />
          */}
          {children}
        </div>
      </body>
    </html>
  );
}
