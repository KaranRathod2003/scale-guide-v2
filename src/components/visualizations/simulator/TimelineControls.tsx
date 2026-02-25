'use client';

import type { SimSpeed } from '@/lib/simulator/types';

interface TimelineControlsProps {
  isRunning: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  speed: SimSpeed;
  onSpeedChange: (speed: SimSpeed) => void;
  tick: number;
}

const speeds: SimSpeed[] = [1, 2, 4];

export default function TimelineControls({
  isRunning,
  onPlay,
  onPause,
  onReset,
  speed,
  onSpeedChange,
  tick,
}: TimelineControlsProps) {
  return (
    <div data-guide-step="timeline" className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-600/40 bg-zinc-700/20 px-2.5 py-2 sm:gap-3 sm:px-3">
      {/* Play/Pause */}
      <button
        onClick={isRunning ? onPause : onPlay}
        className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500/20 text-brand-400 transition-colors hover:bg-brand-500/30 sm:h-8 sm:w-8"
      >
        {isRunning ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="1" width="3" height="10" rx="0.5" />
            <rect x="7" y="1" width="3" height="10" rx="0.5" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3 1.5v9l7-4.5z" />
          </svg>
        )}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-600/40 text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-200 sm:h-8 sm:w-8"
        title="Reset"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1.5 2v3.5H5" />
          <path d="M2.2 5.5A4.5 4.5 0 1 1 2 7" />
        </svg>
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-zinc-600/40" />

      {/* Speed buttons */}
      <div className="flex gap-1">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-medium transition-colors sm:px-2 sm:text-[11px] ${
              speed === s
                ? 'bg-brand-500/20 text-brand-300'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-zinc-600/40" />

      {/* Tick counter */}
      <span className="font-mono text-[10px] text-zinc-400 sm:text-[11px]">
        t={tick}
      </span>
    </div>
  );
}
