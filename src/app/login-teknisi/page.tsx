'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginTeknisiRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?role=TEKNISI');
  }, [router]);

  return null;
}
