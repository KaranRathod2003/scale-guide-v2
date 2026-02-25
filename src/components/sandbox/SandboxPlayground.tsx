'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SqlSandbox from './SqlSandbox';
import K8sSandbox from './K8sSandbox';
import DeploymentSandbox from './DeploymentSandbox';

const tabs = [
  { id: 'sql', label: 'SQL Queries', description: 'Write and validate PostgreSQL queries' },
  { id: 'k8s', label: 'K8s Manifests', description: 'Build Kubernetes resource manifests' },
  { id: 'deployment', label: 'Deploy Configs', description: 'Configure deployment strategies' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function SandboxPlayground({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState<TabId>(
    tabs.some((t) => t.id === initialTab) ? (initialTab as TabId) : 'sql'
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Code Sandbox</h1>
        <p className="text-zinc-400">
          Practice writing SQL queries, Kubernetes manifests, and deployment configurations with instant validation.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-8 flex gap-1 rounded-xl border border-zinc-600/40 bg-surface-raised p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="sandboxActiveTab"
                className="absolute inset-0 rounded-lg bg-brand-500/15"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span
              className={`relative z-10 ${
                activeTab === tab.id ? 'text-brand-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'sql' && <SqlSandbox />}
        {activeTab === 'k8s' && <K8sSandbox />}
        {activeTab === 'deployment' && <DeploymentSandbox />}
      </motion.div>
    </div>
  );
}
