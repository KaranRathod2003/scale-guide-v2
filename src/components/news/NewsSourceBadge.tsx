'use client';

import type { NewsSource } from '@/types/news';

const SOURCE_CONFIG: Record<NewsSource, { label: string; color: string }> = {
  'kubernetes-blog': { label: 'K8s Blog', color: 'bg-blue-500/20 text-blue-300' },
  'postgresql-planet': { label: 'PostgreSQL', color: 'bg-indigo-500/20 text-indigo-300' },
  'devto': { label: 'Dev.to', color: 'bg-emerald-500/20 text-emerald-300' },
  'github-releases': { label: 'GitHub', color: 'bg-zinc-500/20 text-zinc-300' },
};

export default function NewsSourceBadge({ source }: { source: NewsSource }) {
  const config = SOURCE_CONFIG[source];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
