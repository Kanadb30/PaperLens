'use client';
import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const position = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, [role="button"]')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    let animationFrameId: number;
    const animate = () => {
      position.current.x += (targetPosition.current.x - position.current.x) * 0.4;
      position.current.y += (targetPosition.current.y - position.current.y) * 0.4;
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0) translate(-50%, -50%)`;
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[99999] rounded-full border border-[var(--accent-amber)] flex items-center justify-center mix-blend-difference"
      style={{
        width: isHovering ? '32px' : '12px',
        height: isHovering ? '32px' : '12px',
        backgroundColor: isHovering ? 'transparent' : 'var(--accent-amber)',
        transition: 'width 0.2s ease-out, height 0.2s ease-out, background-color 0.2s ease-out'
      }}
    />
  );
}
