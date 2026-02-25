'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PostgreSQLPlayground from '@/components/visualizations/postgresql/PostgreSQLPlayground';

function PostgreSQLVisualizeContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-white">PostgreSQL Playground</h1>
      <p className="mb-8 text-zinc-300">
        Interactive tools to explore PostgreSQL connections, practice SQL queries,
        and visualize connection pooling behavior.
      </p>
      <PostgreSQLPlayground initialTab={tab} />
    </div>
  );
}

export default function PostgreSQLVisualizePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8">Loading...</div>}>
      <PostgreSQLVisualizeContent />
    </Suspense>
  );
}
