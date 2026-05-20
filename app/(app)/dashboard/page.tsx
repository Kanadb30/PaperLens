'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Session } from '@/types';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { LensFocusing } from '@/components/LensFocusing';
import { Footer } from '@/components/Footer';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, `users/${auth.currentUser.uid}/sessions`),
          orderBy('uploadedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
        setSessions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center w-full h-full items-center"><LensFocusing className="w-12 h-12" /></div>;
  }

  return (
    <div className="flex flex-col min-h-full overflow-y-auto">
      <div className="p-12 max-w-6xl mx-auto w-full flex-1">
        <h1 className="text-4xl font-display text-[var(--text-primary)] mb-8 border-b border-[var(--border)] pb-4">My Library</h1>
        
        {sessions.length === 0 ? (
          <div className="text-[var(--text-muted)] font-mono">No analyses yet. Start by uploading a paper.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => (
              <Link key={session.id} href={`/analyze/${session.id}`}>
                <Card className="hover:border-[var(--accent-amber)] transition-colors h-full">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <h3 className="font-body text-lg mb-2 line-clamp-2 text-[var(--text-primary)]">{session.fileName}</h3>
                    <div className="mt-auto pt-4 flex justify-between items-end">
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        {(session.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span className={`text-xs font-mono px-2 py-1 border ${session.status === 'ready' ? 'border-[var(--accent-sage)] text-[var(--accent-sage)]' : session.status === 'error' ? 'border-[var(--accent-rust)] text-[var(--accent-rust)]' : 'border-[var(--accent-amber)] text-[var(--accent-amber)]'}`}>
                        {session.status.toUpperCase()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
