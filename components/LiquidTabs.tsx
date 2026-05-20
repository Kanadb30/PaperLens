'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface LiquidTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function LiquidTabs({ tabs, activeTab, onChange }: LiquidTabsProps) {
  return (
    <div className="flex space-x-2 border-b border-[var(--border)] pb-2 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              isActive ? "text-[var(--bg-void)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="liquid-tab-active"
                className="absolute inset-0 bg-[var(--accent-amber)] rounded-full z-0"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{ clipPath: 'inset(0 0 0 0)' }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
