'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText } from 'lucide-react';
import { ScanningLine } from './ScanningLine';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { set } from 'idb-keyval';

export function PaperUpload() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const sessionId = crypto.randomUUID();

      // Store in IndexedDB instead of sessionStorage
      await set(`pdf_${sessionId}`, base64);

      const sessionRef = doc(db, `users/${user.uid}/sessions`, sessionId);
      await setDoc(sessionRef, {
        id: sessionId,
        fileName: file.name,
        uploadedAt: serverTimestamp(),
        fileSize: file.size,
        status: 'processing'
      });

      const token = await user.getIdToken();

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ base64, fileName: file.name, sessionId })
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || 'Analysis failed');
      }

      router.push(`/analyze/${sessionId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during processing.');
      setIsProcessing(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        {...getRootProps()} 
        className={`relative overflow-hidden border-2 border-dashed transition-colors p-12 flex flex-col items-center justify-center text-center cursor-pointer min-h-[300px]
          ${isDragActive ? 'border-[var(--accent-amber)] bg-[var(--glow)]' : 'border-[var(--border)] hover:border-[var(--accent-sage)]'}
          ${isProcessing ? 'pointer-events-none opacity-80' : ''}
          bg-[var(--bg-card)] paper-texture
        `}
      >
        <ScanningLine active={isProcessing} />
        
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="space-y-4 flex flex-col items-center relative z-10">
            <FileText className="w-12 h-12 text-[var(--accent-amber)] animate-pulse" />
            <h3 className="text-xl font-display text-[var(--text-primary)]">Reading Paper...</h3>
            <p className="text-sm font-mono text-[var(--text-muted)]">Extracting concepts and generating study materials.</p>
          </div>
        ) : (
          <div className="space-y-4 flex flex-col items-center relative z-10">
            <UploadCloud className={`w-12 h-12 ${isDragActive ? 'text-[var(--accent-amber)]' : 'text-[var(--text-muted)]'}`} />
            <h3 className="text-xl font-display text-[var(--text-primary)]">
              {isDragActive ? 'Drop the paper here' : 'Upload Academic Paper'}
            </h3>
            <p className="text-sm font-mono text-[var(--text-muted)]">
              Drag and drop a PDF, or click to select
            </p>
            <p className="text-xs font-mono text-[var(--border)] mt-4">Max 10MB • PDF only</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 border-l-4 border-[var(--accent-rust)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
