'use client';

import type { PgExample, ExerciseDifficulty } from '@/types/postgresql';
import { practiceExamples } from '@/lib/postgresql-data';

interface ExercisePanelProps {
  selected: PgExample | null;
  onSelect: (ex: PgExample) => void;
  filter: ExerciseDifficulty | 'all';
  onFilterChange: (f: ExerciseDifficulty | 'all') => void;
}

const difficultyColors: Record<ExerciseDifficulty, string> = {
  basic: 'text-green-400 bg-green-500/10',
  intermediate: 'text-yellow-400 bg-yellow-500/10',
  advanced: 'text-red-400 bg-red-500/10',
};

export default function ExercisePanel({ selected, onSelect, filter, onFilterChange }: ExercisePanelProps) {
  const filtered = filter === 'all'
    ? practiceExamples
    : practiceExamples.filter((e) => e.difficulty === filter);

  return (
    <div className="space-y-3">
      {/* Difficulty filter */}
      <div className="flex gap-1 rounded-lg bg-zinc-800 p-1">
        {(['all', 'basic', 'intermediate'] as const).map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-brand-500/20 text-brand-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="space-y-1.5">
        {filtered.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onSelect(ex)}
            className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
              selected?.id === ex.id
                ? 'border-brand-400/50 bg-brand-500/5'
                : 'border-zinc-700 bg-surface-raised hover:border-zinc-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${difficultyColors[ex.difficulty]}`}>
                {ex.difficulty}
              </span>
              <span className="text-sm font-medium text-white">{ex.title}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">{ex.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
