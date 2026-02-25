'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Hint } from '@/lib/simulator/types';

interface SmartHintsProps {
  hints: Hint[];
}

const typeConfig: Record<Hint['type'], { icon: string; border: string; bg: string; text: string }> = {
  tip: {
    icon: '\u{1F4A1}',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    text: 'text-blue-300',
  },
  warning: {
    icon: '\u{26A0}\u{FE0F}',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    text: 'text-amber-300',
  },
  success: {
    icon: '\u{2705}',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
    text: 'text-green-300',
  },
};

export default function SmartHints({ hints }: SmartHintsProps) {
  return (
    <div data-guide-step="hints" className="space-y-1.5">
      <AnimatePresence mode="popLayout">
        {hints.map((h) => {
          const cfg = typeConfig[h.type];
          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${cfg.border} ${cfg.bg}`}
            >
              <span className="mt-0.5 text-xs leading-none">{cfg.icon}</span>
              <span className={`text-[11px] leading-relaxed sm:text-xs ${cfg.text}`}>{h.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
