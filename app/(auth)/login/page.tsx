'use client';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsub();
  }, [router]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      await signInWithPopup(auth, googleProvider);
      // Let onAuthStateChanged handle the redirect to ensure state is settled
    } catch (error: any) {
      console.error('Sign-in error:', error);
      setErrorMsg(error.message || 'Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full h-full flex items-center justify-center p-8 min-h-screen">
      <div className="max-w-md w-full bg-[var(--bg-card)] rounded-[2.5rem] paper-texture border border-[var(--border)] p-12 flex flex-col items-center text-center shadow-2xl">
        <div className="w-24 h-24 mb-6 rounded-full overflow-hidden border-2 border-[var(--border)]">
          <Image src="/logo.png" alt="PaperLens Logo" width={96} height={96} className="object-cover w-full h-full" />
        </div>
        <h2 className="text-4xl font-display text-[var(--text-primary)] mb-2">PaperLens</h2>
        <p className="text-sm font-mono text-[var(--text-muted)] mb-6">Sign in to access your private library and analysis sessions.</p>
        
        {errorMsg && (
          <div className="w-full bg-[var(--accent-rust)] bg-opacity-10 border border-[var(--accent-rust)] text-[var(--accent-rust)] p-3 rounded-xl mb-6 text-sm text-left">
            {errorMsg}
          </div>
        )}

        <Button onClick={handleSignIn} disabled={isLoading} className="w-full" variant="outline">
          {isLoading ? 'Authenticating...' : 'Sign in with Google'}
        </Button>
      </div>
    </main>
  );
}
