'use client';
import { Button } from '@/components/ui/Button';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full h-full flex items-center justify-center p-8 min-h-screen">
      <div className="max-w-md w-full bg-[var(--bg-card)] rounded-[2.5rem] paper-texture border border-[var(--border)] p-12 flex flex-col items-center text-center shadow-2xl">
        <h2 className="text-4xl font-display text-[var(--accent-amber)] mb-4">Authenticate</h2>
        <p className="text-sm font-mono text-[var(--text-muted)] mb-8">Access your private library and analysis sessions.</p>
        <Button onClick={handleSignIn} disabled={isLoading} className="w-full" variant="outline">
          {isLoading ? 'Authenticating...' : 'Sign in with Google'}
        </Button>
      </div>
    </main>
  );
}
