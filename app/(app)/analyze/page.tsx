import { PaperUpload } from '@/components/PaperUpload';

export default function AnalyzePage() {
  return (
    <div className="p-12 max-w-4xl mx-auto h-full flex flex-col justify-center">
      <div className="mb-12">
        <h1 className="text-4xl font-display text-[var(--text-primary)] mb-4">New Analysis</h1>
        <p className="font-mono text-[var(--text-muted)]">Upload a PDF to extract its structure and begin interrogation.</p>
      </div>
      <PaperUpload />
    </div>
  );
}
