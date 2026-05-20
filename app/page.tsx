import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="w-full flex-1 flex flex-col items-center justify-center relative z-10 p-8">
        <div className="text-center max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-display text-[var(--accent-amber)] mb-6 tracking-tight">PaperLens</h1>
          <p className="text-xl md:text-2xl font-body text-[var(--text-muted)] mb-12">
            Illuminate the unseen architecture of academic thought. 
            Extract concept maps, Feynman explanations, and interrogate research via context-aware AI.
          </p>
          <Link href="/login">
            <Button size="lg" className="text-lg px-12 py-6 h-auto">
              Enter the Void &rarr;
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
