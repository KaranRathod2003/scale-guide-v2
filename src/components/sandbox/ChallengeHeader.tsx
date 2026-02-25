'use client';

import type { SandboxExercise, SandboxDifficulty } from '@/types/sandbox';

const DIFFICULTY_COLORS: Record<SandboxDifficulty, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  advanced: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function ChallengeHeader({ exercise }: { exercise: SandboxExercise }) {
  return (
    <div className="rounded-lg border border-zinc-600/40 bg-surface-raised p-4">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-base font-semibold text-white">{exercise.title}</h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_COLORS[exercise.difficulty]}`}
        >
          {exercise.difficulty}
        </span>
      </div>
      <p className="mb-2 text-sm text-zinc-300">{exercise.challenge}</p>
      {exercise.setupContext && (
        <div className="rounded-md bg-zinc-800/50 px-3 py-2 text-xs text-zinc-400">
          {exercise.setupContext}
        </div>
      )}
    </div>
  );
}
