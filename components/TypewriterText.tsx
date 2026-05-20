'use client';
import { useEffect, useRef, useState } from 'react';

export function TypewriterText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const textRef = useRef(text);
  const indexRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    textRef.current = text;
    setDisplayedText('');
    indexRef.current = 0;
    lastTimeRef.current = performance.now();

    let animationFrameId: number;

    const animate = (time: number) => {
      if (time - lastTimeRef.current > speed) {
        if (indexRef.current < textRef.current.length) {
          setDisplayedText((prev) => prev + textRef.current.charAt(indexRef.current));
          indexRef.current++;
          lastTimeRef.current = time;
        }
      }
      if (indexRef.current < textRef.current.length) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}
