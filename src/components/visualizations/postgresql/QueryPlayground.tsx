'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PgExample, ExerciseDifficulty } from '@/types/postgresql';
import { queryResults } from '@/lib/simulator/postgresqlSampleData';
import ExercisePanel from './ExercisePanel';
import QueryEditor from './QueryEditor';
import ResultTable from './ResultTable';

function normalizeSQL(sql: string): string {
  return sql
    .toLowerCase()
    .replace(/--.*$/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*;\s*$/, '')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

export default function QueryPlayground() {
  const [selectedExercise, setSelectedExercise] = useState<PgExample | null>(null);
  const [filter, setFilter] = useState<ExerciseDifficulty | 'all'>('all');
  const [query, setQuery] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [runResult, setRunResult] = useState<'correct' | 'incorrect' | null>(null);

  const handleSelectExercise = (ex: PgExample) => {
    setSelectedExercise(ex);
    setQuery('');
    setShowHint(false);
    setShowSolution(false);
    setShowResults(false);
    setRunResult(null);
  };

  const handleRunQuery = () => {
    if (!selectedExercise || !query.trim()) return;
    const userNorm = normalizeSQL(query);
    const solutionNorm = normalizeSQL(selectedExercise.solution);
    const isMatch = userNorm === solutionNorm;
    setRunResult(isMatch ? 'correct' : 'incorrect');
    setShowResults(true);
  };

  const handleRevealSolution = () => {
    if (!selectedExercise) return;
    setQuery(selectedExercise.solution);
    setShowSolution(true);
    setShowResults(true);
    setRunResult('correct');
  };

  const results = selectedExercise && showResults
    ? queryResults[selectedExercise.id] || selectedExercise.expectedOutput
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Left: Exercise selection */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Exercises</h4>
        <ExercisePanel
          selected={selectedExercise}
          onSelect={handleSelectExercise}
          filter={filter}
          onFilterChange={setFilter}
        />
      </div>

      {/* Right: Editor + Results */}
      <div className="space-y-4">
        {selectedExercise ? (
          <>
            {/* Challenge */}
            <div className="rounded-lg border border-zinc-700 bg-surface-raised p-4">
              <h3 className="mb-1 text-sm font-semibold text-white">{selectedExercise.title}</h3>
              <p className="text-sm text-zinc-300">{selectedExercise.challenge}</p>
            </div>

            {/* Setup SQL */}
            <details className="rounded-lg border border-zinc-700 bg-surface-raised">
              <summary className="cursor-pointer px-4 py-3 text-xs font-medium text-zinc-400">Setup SQL</summary>
              <pre className="overflow-x-auto border-t border-zinc-700 bg-zinc-800 p-4 text-xs leading-relaxed text-zinc-300">
                <code>{selectedExercise.setupSQL}</code>
              </pre>
            </details>

            {/* Query editor */}
            <QueryEditor value={query} onChange={(v) => { setQuery(v); setRunResult(null); }} onRun={handleRunQuery} />

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRunQuery}
                disabled={!query.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <polygon points="4,2 14,8 4,14" />
                </svg>
                Run Query
              </button>
              <button
                onClick={() => setShowHint(!showHint)}
                className="rounded-lg border border-zinc-600 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-400"
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              <button
                onClick={handleRevealSolution}
                className="rounded-lg border border-zinc-600 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-400"
              >
                Reveal Solution
              </button>
              {showResults && (
                <button
                  onClick={() => { setShowResults(false); setRunResult(null); }}
                  className="rounded-lg border border-zinc-600 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-400"
                >
                  Hide Results
                </button>
              )}
            </div>

            {/* Run result feedback */}
            <AnimatePresence>
              {runResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`rounded-lg border p-3 text-sm ${
                    runResult === 'correct'
                      ? 'border-green-500/30 bg-green-500/5 text-green-300'
                      : 'border-amber-500/30 bg-amber-500/5 text-amber-300'
                  }`}
                >
                  {runResult === 'correct' ? (
                    <span className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 8.5l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Correct! Your query matches the expected solution.
                    </span>
                  ) : (
                    <span className="flex items-start gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                        <circle cx="8" cy="8" r="6" />
                        <path d="M8 5v3M8 10.5v.5" strokeLinecap="round" />
                      </svg>
                      <span>Not quite. Your query doesn&apos;t match the expected solution. The results below show what the correct query returns -- try adjusting your SQL or use &quot;Show Hint&quot; for guidance.</span>
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint */}
            {showHint && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-300">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider opacity-70">Hint</span>
                {selectedExercise.hint}
              </div>
            )}

            {/* Results */}
            {showResults && <ResultTable data={results} />}
          </>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-700 text-sm text-zinc-400">
            Select an exercise from the left panel to begin.
          </div>
        )}
      </div>
    </div>
  );
}
