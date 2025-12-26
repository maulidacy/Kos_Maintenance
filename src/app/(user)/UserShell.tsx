'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { UserSidebar } from '@/components/layout/UserSidebar';

export default function UserShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar
          role={null}
          showSidebarToggle
          onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
        />

        {/* AREA KONTEN USER → sama seperti AdminShell */}
        <div className="flex w-full flex-1 px-3 py-4 md:px-4 md:py-5">
          <div className="flex w-full items-stretch gap-4">
            {/* SIDEBAR DESKTOP DALAM KARTU SENDIRI */}
            <aside className="hidden w-60 shrink-0 md:block">
              <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/80 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.9)] backdrop-blur">
                <UserSidebar />
              </div>
            </aside>

            {/* KONTEN UTAMA DALAM KARTU BESAR */}
            <main className="flex-1 min-w-0">
              <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-5 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur md:px-5">
                {children}
              </div>
            </main>
          </div>
        </div>

        {/* SIDEBAR MOBILE (DRAWER) */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* overlay */}
            <button
              className="h-full flex-1 bg-black/50"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Tutup sidebar"
            />
            <div className="h-full w-64 border-l border-white/10 bg-slate-950/95 px-3 py-5 shadow-xl backdrop-blur">
              <UserSidebar onNavigate={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
