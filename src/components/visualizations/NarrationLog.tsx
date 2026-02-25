'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'action';
}

const typeStyles: Record<LogEntry['type'], { dot: string; text: string }> = {
  info: { dot: 'bg-blue-400', text: 'text-blue-300' },
  warning: { dot: 'bg-amber-400', text: 'text-amber-300' },
  success: { dot: 'bg-green-400', text: 'text-green-300' },
  error: { dot: 'bg-red-400', text: 'text-red-300' },
  action: { dot: 'bg-brand-400', text: 'text-brand-300' },
};

export default function NarrationLog({ entries }: { entries: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries]);

  return (
    <div
      ref={scrollRef}
      className="max-h-36 overflow-y-auto rounded-lg border border-zinc-600/40 bg-zinc-800/60 p-2 font-mono text-[11px] sm:max-h-48 sm:p-3 sm:text-xs"
    >
      {entries.length === 0 && (
        <span className="text-zinc-400">Select a scenario and watch the events unfold...</span>
      )}
      <AnimatePresence>
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-2 py-1"
          >
            <span className="shrink-0 text-zinc-400">{entry.timestamp}</span>
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${typeStyles[entry.type].dot}`} />
            <span className={typeStyles[entry.type].text}>{entry.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
