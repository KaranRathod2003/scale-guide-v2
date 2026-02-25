'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ConnectionSimulator from './ConnectionSimulator';
import QueryPlayground from './QueryPlayground';
import PoolVisualizer from './PoolVisualizer';

const tabs = [
  { id: 'connection', label: 'Connection Simulator' },
  { id: 'query', label: 'Query Practice' },
  { id: 'pool', label: 'Pool Visualizer' },
] as const;

type TabId = (typeof tabs)[number]['id'];

interface PostgreSQLPlaygroundProps {
  initialTab?: string;
}

export default function PostgreSQLPlayground({ initialTab }: PostgreSQLPlaygroundProps) {
  const [activeTab, setActiveTab] = useState<TabId>(
    tabs.find((t) => t.id === initialTab)?.id || 'connection'
  );

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-xl bg-zinc-800 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="pg-tab-bg"
                className="absolute inset-0 rounded-lg bg-brand-500/20"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'connection' && <ConnectionSimulator />}
        {activeTab === 'query' && <QueryPlayground />}
        {activeTab === 'pool' && <PoolVisualizer />}
      </motion.div>
    </div>
  );
}
