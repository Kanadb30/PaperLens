'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageFoldTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ rotateY: 8, x: '100%', opacity: 0 }}
        animate={{ rotateY: 0, x: '0%', opacity: 1 }}
        exit={{ rotateY: -8, x: '-100%', opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'left center', width: '100%', height: '100%' }}
        className="overflow-y-auto overflow-x-hidden w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
