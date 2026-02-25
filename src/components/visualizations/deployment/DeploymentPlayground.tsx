'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import BlueGreenVisualization from './BlueGreenVisualization';
import CanaryVisualization from './CanaryVisualization';
import RollingUpdateVisualization from './RollingUpdateVisualization';
import RecreateVisualization from './RecreateVisualization';
import ABTestingVisualization from './ABTestingVisualization';
import ShadowVisualization from './ShadowVisualization';

const tabs = [
  { id: 'blue-green', label: 'Blue-Green', icon: 'BG' },
  { id: 'canary', label: 'Canary', icon: 'CN' },
  { id: 'rolling-update', label: 'Rolling', icon: 'RU' },
  { id: 'recreate', label: 'Recreate', icon: 'RC' },
  { id: 'ab-testing', label: 'A/B Test', icon: 'AB' },
  { id: 'shadow', label: 'Shadow', icon: 'SH' },
];

const visualizations: Record<string, React.ReactNode> = {
  'blue-green': <BlueGreenVisualization />,
  canary: <CanaryVisualization />,
  'rolling-update': <RollingUpdateVisualization />,
  recreate: <RecreateVisualization />,
  'ab-testing': <ABTestingVisualization />,
  shadow: <ShadowVisualization />,
};

export default function DeploymentPlayground({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'blue-green');

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
        <div className="flex gap-1 rounded-xl border border-zinc-600/40 bg-zinc-700/30 p-1 sm:p-1.5" style={{ minWidth: 'min-content' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium transition-colors sm:flex-1 sm:px-3 sm:py-2.5 sm:text-sm ${
                activeTab === tab.id ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="deployActiveTab"
                  className="absolute inset-0 rounded-lg bg-zinc-700 shadow-lg shadow-black/20"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                <span className={`hidden text-[10px] font-mono sm:inline ${
                  activeTab === tab.id ? 'text-brand-400' : 'text-zinc-400'
                }`}>
                  {tab.icon}
                </span>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active visualization */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="rounded-xl border border-zinc-600/40 bg-surface-raised p-4 sm:rounded-2xl sm:p-6 lg:p-8"
      >
        {visualizations[activeTab]}
      </motion.div>
    </div>
  );
}
