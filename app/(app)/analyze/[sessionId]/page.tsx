'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Session } from '@/types';
import { LensFocusing } from '@/components/LensFocusing';
import { LiquidTabs } from '@/components/LiquidTabs';
import { ConceptGraph } from '@/components/ConceptGraph';
import { ExamCard } from '@/components/ExamCard';
import { ChatInterface } from '@/components/ChatInterface';
import { SessionSummary } from '@/components/SessionSummary';

import { get } from 'idb-keyval';

const tabs = [
  { id: 'concept', label: 'Concept Map' },
  { id: 'eli5', label: 'ELI5 Breakdown' },
  { id: 'exam', label: 'Exam Simulator' },
  { id: 'chat', label: 'Interrogate' }
];

export default function AnalysisResultPage() {
  const { sessionId } = useParams() as { sessionId: string };
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('concept');
  const [showSummary, setShowSummary] = useState(false);
  const [base64Pdf, setBase64Pdf] = useState<string>('');

  const [generatingELI5, setGeneratingELI5] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [generatingExam, setGeneratingExam] = useState(false);

  useEffect(() => {
    get(`pdf_${sessionId}`).then((storedBase64) => {
      if (storedBase64) {
        setBase64Pdf(storedBase64 as string);
      }
    });
  }, [sessionId]);

  useEffect(() => {
    if (activeTab === 'eli5' && session && !session.eli5 && !generatingELI5 && base64Pdf) {
      setGeneratingELI5(true);
      auth.currentUser?.getIdToken().then(token => {
        fetch('/api/generate/eli5', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ base64: base64Pdf, sessionId, action: 'init' })
        }).finally(() => setGeneratingELI5(false));
      });
    }

    if (activeTab === 'eli5' && session?.eli5 && base64Pdf && !generatingSection) {
      const nextSection = session.eli5.find(s => s.isLoading);
      if (nextSection) {
        setGeneratingSection(nextSection.section);
        auth.currentUser?.getIdToken().then(token => {
          fetch('/api/generate/eli5', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ base64: base64Pdf, sessionId, action: 'chunk', sectionTitle: nextSection.section })
          }).finally(() => setGeneratingSection(null));
        });
      }
    }

    if (activeTab === 'exam' && session && !session.examQuestions && !generatingExam && base64Pdf) {
      setGeneratingExam(true);
      auth.currentUser?.getIdToken().then(token => {
        fetch('/api/generate/exam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ base64: base64Pdf, sessionId })
        }).finally(() => setGeneratingExam(false));
      });
    }
  }, [activeTab, session, generatingELI5, generatingSection, generatingExam, base64Pdf, sessionId]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, `users/${auth.currentUser.uid}/sessions`, sessionId), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as Session;
        setSession(data);
        if (data.status === 'ready' && loading) {
           setShowSummary(true);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [sessionId, loading]);

  if (loading || (session?.status === 'processing')) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <LensFocusing className="w-16 h-16 mb-6" />
        <p className="font-mono text-[var(--text-muted)] animate-pulse">Analysis in progress...</p>
      </div>
    );
  }

  if (!session) {
    return <div className="p-8">Session not found.</div>;
  }

  if (session.status === 'error') {
    return <div className="p-8 text-[var(--accent-rust)]">Analysis failed. Please try again.</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SessionSummary 
        isOpen={showSummary} 
        onDismiss={() => setShowSummary(false)} 
        session={session} 
      />

      <div className="p-6 border-b border-[var(--border)] shrink-0 bg-[var(--bg-void)] z-10 relative">
        <h1 className="text-2xl font-display text-[var(--text-primary)] mb-4 truncate">{session.fileName}</h1>
        <LiquidTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto relative p-6">
        {activeTab === 'concept' && session.conceptMap && (
          <div className="w-full h-full border border-[var(--border)] bg-[var(--bg-card)]">
            <ConceptGraph data={session.conceptMap} />
          </div>
        )}
        
        {activeTab === 'eli5' && !session.eli5 && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <LensFocusing className="w-12 h-12 mb-4" />
            <p className="font-mono text-[var(--text-muted)] animate-pulse">Generating ELI5 Breakdown (All Sections)...</p>
          </div>
        )}
        
        {activeTab === 'eli5' && session.eli5 && (
          <div className="max-w-3xl mx-auto space-y-8 pb-12">
            {session.eli5.map((section, i) => (
              <div key={i} className="border-l-2 border-[var(--accent-amber)] pl-6 py-2">
                <h3 className="text-xl font-display mb-3">{section.section}</h3>
                {section.isLoading ? (
                  <div className="flex items-center space-x-4 p-4 border border-[var(--border)] bg-[var(--bg-surface)]">
                    <LensFocusing className="w-6 h-6" />
                    <span className="font-mono text-[var(--text-muted)] animate-pulse">Synthesizing...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-[var(--text-primary)] mb-4 leading-relaxed">{section.simpleExplanation}</p>
                    <div className="bg-[var(--bg-surface)] p-4 border border-[var(--border)] text-sm">
                      <span className="font-mono text-[var(--accent-sage)] mr-2">Analogy:</span>
                      <span className="text-[var(--text-muted)]">{section.analogy}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'exam' && !session.examQuestions && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <LensFocusing className="w-12 h-12 mb-4" />
            <p className="font-mono text-[var(--text-muted)] animate-pulse">Generating Exam Simulator...</p>
          </div>
        )}

        {activeTab === 'exam' && session.examQuestions && (
          <div className="max-w-2xl mx-auto pb-12">
            {session.examQuestions.map((q, i) => (
              <ExamCard key={q.id || i} question={q} index={i} />
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="w-full max-w-4xl mx-auto h-[calc(100vh-12rem)] border border-[var(--border)] bg-[var(--bg-void)]">
            {base64Pdf ? (
              <ChatInterface 
                sessionId={sessionId} 
                initialHistory={session.chatHistory || []} 
                base64Pdf={base64Pdf} 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center border border-[var(--border)] bg-[var(--bg-surface)]">
                <p className="text-[var(--text-muted)] font-mono mb-4">
                  Original PDF is required for chat. Please re-upload the file to continue interrogating.
                </p>
                <div className="flex flex-col items-center space-y-4">
                  <span className="text-sm border border-[var(--accent-rust)] text-[var(--accent-rust)] px-4 py-2">Missing Context Data</span>
                  <label className="cursor-pointer bg-[var(--accent-amber)] text-[var(--bg-void)] px-6 py-2 font-mono font-bold hover:bg-opacity-90 transition-colors">
                    Restore Context
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.type !== 'application/pdf') {
                          alert('Only PDF files are accepted.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const base64 = (reader.result as string).split(',')[1];
                          const { set } = await import('idb-keyval');
                          await set(`pdf_${sessionId}`, base64);
                          setBase64Pdf(base64);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
