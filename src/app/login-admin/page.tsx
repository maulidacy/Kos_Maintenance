'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?role=ADMIN');
  }, [router]);

  return null;
}
