'use client';

import { motion } from 'framer-motion';
import type { K8sResource } from '@/types/sandbox';
import { mapResourcesToVisual, type VisualResource } from '@/lib/sandbox/k8s-resource-mapper';

const ICON_COLORS: Record<VisualResource['icon'], string> = {
  pod: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  service: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  deployment: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
  hpa: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  configmap: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
  ingress: 'border-pink-500/40 bg-pink-500/10 text-pink-400',
  storage: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
  other: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400',
};

const ICON_LABELS: Record<VisualResource['icon'], string> = {
  pod: 'POD',
  service: 'SVC',
  deployment: 'DEP',
  hpa: 'HPA',
  configmap: 'CFG',
  ingress: 'ING',
  storage: 'PVC',
  other: 'K8S',
};

function ResourceCard({ resource, index }: { resource: VisualResource; index: number }) {
  const colorClass = ICON_COLORS[resource.icon];
  const iconLabel = ICON_LABELS[resource.icon];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-lg border p-4 ${colorClass}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-md border border-current px-1.5 py-0.5 text-[10px] font-bold">
          {iconLabel}
        </span>
        <div>
          <div className="text-sm font-semibold">{resource.name}</div>
          <div className="text-[10px] opacity-75">{resource.kind}</div>
        </div>
      </div>
      <div className="space-y-1">
        {resource.details.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="opacity-60">{d.label}</span>
            <span className="font-mono text-[11px]">{d.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ResourceVisualization({ resources }: { resources: K8sResource[] }) {
  const visual = mapResourcesToVisual(resources);

  if (visual.length === 0) return null;

  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Detected Resources
      </h4>
      <div className="grid gap-3 sm:grid-cols-2">
        {visual.map((r, i) => (
          <ResourceCard key={`${r.kind}-${r.name}`} resource={r} index={i} />
        ))}
      </div>
    </div>
  );
}
