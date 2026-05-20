import { ExamQuestion } from '@/types';
import { Card, CardContent } from './ui/Card';

export function ExamCard({ question, index }: { question: ExamQuestion; index: number }) {
  return (
    <Card className="relative overflow-hidden mb-6 paper-texture">
      <div className="absolute top-[-1rem] left-2 text-[6rem] font-display text-[var(--accent-amber)] opacity-10 pointer-events-none select-none leading-none">
        {index + 1}
      </div>
      <CardContent className="pt-8 relative z-10">
        <h4 className="text-xl font-body mb-4 font-bold">{question.question}</h4>
        
        {question.type === 'MCQ' && question.options && (
          <div className="space-y-2 mb-6">
            {question.options.map((opt, i) => (
              <div key={i} className="flex items-start">
                <span className="font-mono text-[var(--accent-amber)] mr-3">{String.fromCharCode(65 + i)}.</span>
                <span className="font-body text-[var(--text-primary)]">{opt}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <p className="text-sm font-mono text-[var(--accent-sage)] mb-1">Model Answer</p>
          <p className="text-sm font-body text-[var(--text-muted)] italic">{question.modelAnswer}</p>
        </div>
      </CardContent>
    </Card>
  );
}
