'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Session } from '@/types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface SessionSummaryProps {
  isOpen: boolean;
  onDismiss: () => void;
  session: Session | null;
}

export function SessionSummary({ isOpen, onDismiss, session }: SessionSummaryProps) {
  if (!session) return null;

  const nodeCount = session.conceptMap?.nodes.length || 0;
  const edgeCount = session.conceptMap?.edges.length || 0;
  const connectivityIndex = nodeCount > 0 ? (edgeCount / nodeCount).toFixed(1) : "0.0";
  const eli5Coverage = session.eli5?.length || 0;
  
  const mcqCount = session.examQuestions?.filter(q => q.type === 'MCQ').length || 0;
  const shortCount = session.examQuestions?.filter(q => q.type === 'short').length || 0;
  const longCount = session.examQuestions?.filter(q => q.type === 'long').length || 0;
  
  const totalQuestions = session.examQuestions?.length || 1;
  const mcqPct = (mcqCount / totalQuestions) * 100;
  const shortPct = (shortCount / totalQuestions) * 100;
  const longPct = (longCount / totalQuestions) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-2xl bg-[var(--bg-card)] paper-texture border-t border-x border-[var(--border)] p-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-3xl font-display text-[var(--accent-amber)] mb-6">Analysis Complete</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-mono text-[var(--text-muted)] mb-1">Concepts Extracted</p>
                  <p className="text-4xl font-display">{nodeCount}</p>
                </div>
                <div>
                  <p className="text-sm font-mono text-[var(--text-muted)] mb-1">Connectivity Index</p>
                  <p className="text-4xl font-display">{connectivityIndex}</p>
                </div>
                <div>
                  <p className="text-sm font-mono text-[var(--text-muted)] mb-1">ELI5 Coverage</p>
                  <p className="text-lg font-body">{eli5Coverage} sections explained</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-mono text-[var(--text-muted)] mb-2">Exam Breakdown</p>
                  <div className="flex h-4 w-full bg-[var(--bg-surface)] overflow-hidden">
                    <div style={{ width: `${mcqPct}%` }} className="bg-[var(--accent-amber)]" title={`MCQ: ${mcqCount}`} />
                    <div style={{ width: `${shortPct}%` }} className="bg-[var(--accent-sage)]" title={`Short: ${shortCount}`} />
                    <div style={{ width: `${longPct}%` }} className="bg-[var(--accent-rust)]" title={`Long: ${longCount}`} />
                  </div>
                  <div className="flex text-xs font-mono text-[var(--text-muted)] justify-between mt-1">
                    <span>MCQ: {mcqCount}</span>
                    <span>Short: {shortCount}</span>
                    <span>Long: {longCount}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-mono text-[var(--text-muted)] mb-2">Security Verification</p>
                  {session.securityChecks?.map((check, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--accent-sage)] shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[var(--accent-rust)] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-body font-medium">{check.check}</p>
                        <p className="text-xs font-mono text-[var(--text-muted)]">{check.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Button onClick={onDismiss} size="lg" className="w-full">
              Enter PaperLens &rarr;
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
