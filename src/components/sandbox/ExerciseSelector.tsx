'use client';

import { useState } from 'react';
import type { SandboxExercise, SandboxDifficulty } from '@/types/sandbox';

const DIFFICULTY_COLORS: Record<SandboxDifficulty, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-300',
  intermediate: 'bg-amber-500/20 text-amber-300',
  advanced: 'bg-red-500/20 text-red-300',
};

interface ExerciseSelectorProps {
  exercises: SandboxExercise[];
  selected: SandboxExercise | null;
  onSelect: (ex: SandboxExercise) => void;
}

export default function ExerciseSelector({
  exercises,
  selected,
  onSelect,
}: ExerciseSelectorProps) {
  const [filter, setFilter] = useState<SandboxDifficulty | 'all'>('all');

  const filtered =
    filter === 'all'
      ? exercises
      : exercises.filter((ex) => ex.difficulty === filter);

  const categories = Array.from(new Set(filtered.map((ex) => ex.category)));

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-zinc-800 p-1">
        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`flex-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
              filter === d
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div className="max-h-[500px] space-y-4 overflow-y-auto">
        {categories.map((cat) => (
          <div key={cat}>
            <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {cat}
            </h4>
            <div className="space-y-1">
              {filtered
                .filter((ex) => ex.category === cat)
                .map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => onSelect(ex)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selected?.id === ex.id
                        ? 'border border-brand-400/50 bg-brand-500/10 text-brand-400'
                        : 'border border-transparent text-zinc-300 hover:bg-zinc-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate font-medium">{ex.title}</span>
                      <span
                        className={`ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${DIFFICULTY_COLORS[ex.difficulty]}`}
                      >
                        {ex.difficulty}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
