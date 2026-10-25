'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../lib/auth-context';

export default function AdminRootPage() {
  const router = useRouter();
  const { adminUser, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading) {
      if (adminUser) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [adminUser, loading, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--slate-500)' }}>
      Routing to ReserveEase Management Portal...
    </div>
  );
}
