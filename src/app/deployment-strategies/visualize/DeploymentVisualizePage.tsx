'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import DeploymentPlayground from '@/components/visualizations/deployment/DeploymentPlayground';

function DeploymentVisualizeContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-white">Deployment Strategy Visualizations</h1>
      <p className="mb-8 text-zinc-300">
        Watch deployment strategies in action. Each strategy shows a failure scenario and a
        success scenario with real-world company examples.
      </p>
      <DeploymentPlayground initialTab={tab} />
    </div>
  );
}

export default function DeploymentVisualizePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8">Loading...</div>}>
      <DeploymentVisualizeContent />
    </Suspense>
  );
}
