'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TypewriterText } from './TypewriterText';
import { LensFocusing } from './LensFocusing';
import { SendHorizontal } from 'lucide-react';

interface ChatInterfaceProps {
  sessionId: string;
  initialHistory: ChatMessage[];
  base64Pdf: string;
}

export function ChatInterface({ sessionId, initialHistory, base64Pdf }: ChatInterfaceProps) {
  const [history, setHistory] = useState<ChatMessage[]>(initialHistory);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading, showRetry]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowRetry(false);

    try {
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          base64: base64Pdf,
          history: history,
          message: userMessage.parts[0].text
        })
      });

      if (!response.ok || !response.body) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let modelResponseText = '';

      setHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        modelResponseText += chunkValue;
        
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].parts[0].text = modelResponseText;
          return newHistory;
        });
      }
      
      if (!modelResponseText.trim() || /I (cannot|can't|am unable to)/i.test(modelResponseText)) {
        setShowRetry(true);
      }

    } catch (error) {
      console.error(error);
      setShowRetry(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {history.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 border rounded-[2rem] ${
                  msg.role === 'user' 
                    ? 'border-[var(--accent-rust)] border-l-4 bg-[var(--bg-surface)] text-[var(--text-primary)]' 
                    : 'border-[var(--accent-amber)] border-l-4 bg-[var(--bg-card)] paper-texture text-[var(--text-primary)]'
                }`}
              >
                {msg.role === 'model' && i === history.length - 1 ? (
                  <TypewriterText text={msg.parts[0].text} speed={10} />
                ) : (
                  <span className="whitespace-pre-wrap">{msg.parts[0].text}</span>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="p-4"><LensFocusing className="w-6 h-6" /></div>
            </motion.div>
          )}
          {showRetry && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="p-4 border border-[var(--border)] rounded-3xl bg-[var(--bg-surface)] flex flex-col space-y-2">
                <span className="text-sm text-[var(--text-muted)]">PaperLens couldn't answer from the paper. Try rephrasing.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border)]">
        <form onSubmit={handleSend} className="flex space-x-2">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask about the paper..." 
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            <SendHorizontal className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
