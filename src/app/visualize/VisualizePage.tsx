'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ScalingPlayground from '@/components/visualizations/ScalingPlayground';

function VisualizeContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-white">Interactive Visualizations</h1>
      <p className="mb-8 text-zinc-300">
        Watch autoscaling happen in real-time. Click the trigger button and observe
        how each approach responds to load changes.
      </p>
      <ScalingPlayground initialTab={tab} />
    </div>
  );
}

export default function VisualizePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8">Loading...</div>}>
      <VisualizeContent />
    </Suspense>
  );
}
