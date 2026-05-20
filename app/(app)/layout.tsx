'use client';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LensFocusing } from '@/components/LensFocusing';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[var(--bg-void)]">
        <LensFocusing className="w-16 h-16" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex relative">
      <Sidebar />
      <main className="flex-1 ml-16 overflow-hidden bg-[var(--bg-void)] relative z-0 h-full">
        {children}
      </main>
    </div>
  );
}
