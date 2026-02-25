'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import HPAVisualization from './HPAVisualization';
import VPAVisualization from './VPAVisualization';
import ClusterVisualization from './ClusterVisualization';
import KEDAVisualization from './KEDAVisualization';

const tabs = [
  { id: 'hpa', label: 'HPA', description: 'Horizontal Pod Autoscaler' },
  { id: 'vpa', label: 'VPA', description: 'Vertical Pod Autoscaler' },
  { id: 'cluster-autoscaler', label: 'Cluster', description: 'Cluster Autoscaler' },
  { id: 'keda', label: 'KEDA', description: 'Event-Driven' },
];

const visualizations: Record<string, React.ReactNode> = {
  hpa: <HPAVisualization />,
  vpa: <VPAVisualization />,
  'cluster-autoscaler': <ClusterVisualization />,
  keda: <KEDAVisualization />,
};

export default function ScalingPlayground({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'hpa');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-zinc-600/40 bg-zinc-700/30 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
              activeTab === tab.id ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg bg-zinc-700"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active visualization */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-zinc-600/40 bg-surface-raised p-4 sm:rounded-2xl sm:p-6 lg:p-8"
      >
        {visualizations[activeTab]}
      </motion.div>
    </div>
  );
}
