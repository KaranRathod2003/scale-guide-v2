'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HintPanelProps {
  hint: string;
  solution: string;
  onLoadSolution: () => void;
}

export default function HintPanel({ hint, solution, onLoadSolution }: HintPanelProps) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => setShowHint(!showHint)}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </button>
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </button>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          >
            {hint}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSolution && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-zinc-600/40 bg-zinc-800/80 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Solution</span>
                <button
                  onClick={onLoadSolution}
                  className="rounded-md bg-brand-500/20 px-2 py-1 text-[10px] font-medium text-brand-400 transition-colors hover:bg-brand-500/30"
                >
                  Load in Editor
                </button>
              </div>
              <pre className="overflow-x-auto text-xs text-zinc-300">
                <code>{solution}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
