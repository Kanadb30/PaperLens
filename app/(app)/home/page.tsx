'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/Footer';
import { UploadCloud, Library } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full overflow-y-auto">
      <div className="p-12 max-w-6xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <Image src="/icon.png" alt="PaperLens Logo" width={120} height={120} className="mx-auto border border-[var(--border)] rounded-sm p-2 bg-[var(--bg-card)] shadow-lg" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display text-[var(--text-primary)] mb-6 border-b border-[var(--border)] pb-4 inline-block">
          Welcome to PaperLens
        </h1>
        
        <p className="text-xl font-body text-[var(--text-muted)] mb-12 max-w-2xl">
          Illuminate the unseen architecture of your documents. 
          Ready to extract concept maps, Feynman explanations, and interrogate your research?
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <Link href="/analyze">
            <Button size="lg" className="text-lg px-8 py-4 h-auto flex items-center space-x-3">
              <UploadCloud className="w-6 h-6" />
              <span>Start New Analysis</span>
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto flex items-center space-x-3">
              <Library className="w-6 h-6" />
              <span>Browse Library</span>
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
