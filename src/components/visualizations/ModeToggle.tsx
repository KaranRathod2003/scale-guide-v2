'use client';

import { motion } from 'framer-motion';

interface ModeToggleProps {
  mode: 'stories' | 'simulator';
  onChange: (mode: 'stories' | 'simulator') => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex rounded-lg border border-zinc-600/40 bg-zinc-700/40 p-0.5">
        {(['stories', 'simulator'] as const).map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className="relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm"
          >
            {mode === m && (
              <motion.div
                layoutId="mode-pill"
                className="absolute inset-0 rounded-md bg-brand-500/20 border border-brand-400/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${mode === m ? 'text-brand-300' : 'text-zinc-300 hover:text-zinc-200'}`}>
              {m === 'stories' ? 'Stories' : 'Simulator'}
            </span>
          </button>
        ))}
      </div>
      {mode === 'simulator' && (
        <button
          onClick={() => {
            const replay = (window as unknown as Record<string, unknown>).__replaySimulatorGuide;
            if (typeof replay === 'function') (replay as () => void)();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-600/40 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
          title="Replay simulator guide"
        >
          ?
        </button>
      )}
    </div>
  );
}
