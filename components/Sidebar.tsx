'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, UploadCloud, Library, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export function Sidebar() {
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', href: '/home' },
    { id: 'analyze', icon: UploadCloud, label: 'New Analysis', href: '/analyze' },
    { id: 'library', icon: Library, label: 'My Library', href: '/dashboard' },
  ];

  const handleSignOut = () => {
    signOut(auth).then(() => {
      window.location.href = '/';
    });
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-16 bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col items-center py-8 z-50">
      <div className="mb-12 font-display text-2xl text-[var(--accent-amber)] select-none">P</div>
      
      <div className="flex-1 flex flex-col space-y-6 w-full items-center">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
          return (
            <div 
              key={item.id}
              className="relative flex items-center justify-center w-full"
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link href={item.href} className="w-10 h-10 flex items-center justify-center relative">
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[var(--accent-amber)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`} />
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute -left-3 w-1 h-8 bg-[var(--accent-amber)]" />
                )}
              </Link>
              
              <AnimatePresence>
                {hovered === item.id && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute left-16 bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-1 text-sm font-mono whitespace-nowrap"
                  >
                    {item.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col space-y-6 w-full items-center">
        <button 
          onClick={handleSignOut}
          onMouseEnter={() => setHovered('logout')}
          onMouseLeave={() => setHovered(null)}
          className="relative flex items-center justify-center w-full"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-[var(--text-muted)] hover:text-[var(--accent-rust)] transition-colors" />
          </div>
          <AnimatePresence>
            {hovered === 'logout' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute left-16 bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-1 text-sm font-mono whitespace-nowrap"
              >
                Sign Out
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
