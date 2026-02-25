'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { SandboxExercise, DeploymentValidationResult } from '@/types/sandbox';
import { deploymentExercises } from '@/lib/sandbox/exercises/deployment-exercises';
import { validateDeploymentConfig } from '@/lib/sandbox/validation/deployment-validator';
import ExerciseSelector from './ExerciseSelector';
import ChallengeHeader from './ChallengeHeader';
import ValidationOutput from './ValidationOutput';
import HintPanel from './HintPanel';

const CodeEditor = dynamic(() => import('./CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] animate-pulse rounded-lg border border-zinc-700 bg-zinc-800" />
  ),
});

export default function DeploymentSandbox() {
  const [selected, setSelected] = useState<SandboxExercise | null>(null);
  const [code, setCode] = useState('');
  const [validation, setValidation] = useState<DeploymentValidationResult | null>(null);

  const handleSelect = (ex: SandboxExercise) => {
    setSelected(ex);
    setCode(ex.starterCode);
    setValidation(null);
  };

  const handleValidate = () => {
    if (!selected) return;
    const result = validateDeploymentConfig(code, selected);
    setValidation(result);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div>
        <ExerciseSelector exercises={deploymentExercises} selected={selected} onSelect={handleSelect} />
      </div>

      <div className="space-y-4">
        {selected ? (
          <>
            <ChallengeHeader exercise={selected} />

            <CodeEditor
              value={code}
              onChange={setCode}
              language="yaml"
              onRun={handleValidate}
              height="350px"
            />

            <div className="flex gap-2">
              <button
                onClick={handleValidate}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                Validate Config
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
              <ValidationOutput validation={{ type: 'deployment', result: validation }} />
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
