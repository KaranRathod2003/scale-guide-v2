'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { SandboxExercise, SqlValidationResult } from '@/types/sandbox';
import { sqlExercises } from '@/lib/sandbox/exercises/sql-exercises';
import { validateSQL } from '@/lib/sandbox/validation/sql-validator';
import ExerciseSelector from './ExerciseSelector';
import ChallengeHeader from './ChallengeHeader';
import ValidationOutput from './ValidationOutput';
import HintPanel from './HintPanel';

const CodeEditor = dynamic(() => import('./CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] animate-pulse rounded-lg border border-zinc-700 bg-zinc-800" />
  ),
});

export default function SqlSandbox() {
  const [selected, setSelected] = useState<SandboxExercise | null>(null);
  const [code, setCode] = useState('');
  const [validation, setValidation] = useState<SqlValidationResult | null>(null);

  const handleSelect = (ex: SandboxExercise) => {
    setSelected(ex);
    setCode(ex.starterCode);
    setValidation(null);
  };

  const handleRun = () => {
    if (!selected) return;
    const result = validateSQL(code, selected);
    setValidation(result);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div>
        <ExerciseSelector exercises={sqlExercises} selected={selected} onSelect={handleSelect} />
      </div>

      <div className="space-y-4">
        {selected ? (
          <>
            <ChallengeHeader exercise={selected} />

            <CodeEditor
              value={code}
              onChange={setCode}
              language="sql"
              onRun={handleRun}
            />

            <div className="flex gap-2">
              <button
                onClick={handleRun}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                Run Query
              </button>
              <button
                onClick={() => {
                  setCode(selected.starterCode);
                  setValidation(null);
                }}
                className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-600"
              >
                Reset
              </button>
            </div>

            {validation && (
              <ValidationOutput validation={{ type: 'sql', result: validation }} />
            )}

            {validation?.isCorrect && (
              <div className="rounded-lg border border-zinc-600/40 bg-surface-raised p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Query Results
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        {Object.keys(validation.results[0] || {}).map((key) => (
                          <th key={key} className="px-3 py-2 font-medium text-zinc-300">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {validation.results.map((row, i) => (
                        <tr key={i} className="border-b border-zinc-700/50">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-3 py-2 text-zinc-400">
                              {val === null ? <span className="italic text-zinc-600">NULL</span> : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <HintPanel
              hint={selected.hint}
              solution={selected.solution}
              onLoadSolution={() => setCode(selected.solution)}
            />
          </>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-600/40 text-zinc-500">
            Select an exercise from the left panel to begin
          </div>
        )}
      </div>
    </div>
  );
}
