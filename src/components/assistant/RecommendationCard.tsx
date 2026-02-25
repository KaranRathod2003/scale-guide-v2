'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Recommendation } from '@/types/assistant';
import type { AssistantTopic } from '@/hooks/useAssistant';

const scalingNames: Record<string, string> = {
  hpa: 'Horizontal Pod Autoscaler (HPA)',
  vpa: 'Vertical Pod Autoscaler (VPA)',
  'cluster-autoscaler': 'Cluster Autoscaler',
  keda: 'KEDA',
};

const deploymentNames: Record<string, string> = {
  'blue-green': 'Blue-Green Deployment',
  canary: 'Canary Deployment',
  'rolling-update': 'Rolling Update',
  recreate: 'Recreate Deployment',
  'ab-testing': 'A/B Testing Deployment',
  shadow: 'Shadow (Dark) Deployment',
};

const postgresNames: Record<string, string> = {
  'prerequisites-setup': 'Prerequisites & Setup',
  'why-postgresql': 'Why PostgreSQL?',
  'backend-connections': 'Backend Connections',
  'practice-examples': 'Practice Examples',
  'official-docs-summary': 'Official Docs Summary',
};

export default function RecommendationCard({ recommendation, topic = 'scaling', onNavigate }: { recommendation: Recommendation; topic?: AssistantTopic; onNavigate?: () => void }) {
  const isDeployment = topic === 'deployment';
  const isPostgres = topic === 'postgresql';
  const names = isPostgres ? postgresNames : isDeployment ? deploymentNames : scalingNames;

  const visualizeHref = isPostgres
    ? `/postgresql/visualize`
    : isDeployment
    ? `/deployment-strategies/visualize?tab=${recommendation.primary}`
    : `/visualize?tab=${recommendation.primary}`;

  const docsHref = isPostgres
    ? `/postgresql/${recommendation.primary}`
    : isDeployment
    ? `/deployment-strategies/${recommendation.primary}`
    : `/docs/${recommendation.primary}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-brand-400/30 bg-brand-500/5 p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-medium text-brand-400">Recommended</span>
        <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-medium text-brand-300">
          {recommendation.confidence}% match
        </span>
      </div>

      <h3 className="mb-1 text-sm font-semibold text-white">
        {names[recommendation.primary] || recommendation.primary}
      </h3>

      {recommendation.secondary && (
        <p className="mb-2 text-xs text-zinc-300">
          + {names[recommendation.secondary] || recommendation.secondary}
        </p>
      )}

      <p className="mb-3 text-xs leading-relaxed text-zinc-300">{recommendation.reasoning}</p>

      {recommendation.warnings.length > 0 && (
        <div className="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          {recommendation.warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={visualizeHref}
          onClick={onNavigate}
          className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
        >
          See Visualization
        </Link>
        <Link
          href={docsHref}
          onClick={onNavigate}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-400"
        >
          Read Docs
        </Link>
      </div>
    </motion.div>
  );
}
