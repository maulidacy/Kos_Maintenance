// src/app/teknisi/layout.tsx
import type { ReactNode } from 'react';
import TeknisiShell from './TeknisiShell';

export const metadata = {
  title: 'Teknisi | Kos Maintenance',
};

export default function TeknisiLayout({ children }: { children: ReactNode }) {
  return <TeknisiShell>{children}</TeknisiShell>;
}
