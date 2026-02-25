import Link from 'next/link';
import { deploymentStrategies, comboApproaches } from '@/lib/deployment-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deployment Strategies',
  description: 'Complete guide to Kubernetes deployment strategies: Blue-Green, Canary, Rolling Update, Recreate, A/B Testing, and Shadow deployments.',
};

const complexityColor: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

export default function DeploymentStrategiesIndex() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Deployment Strategies</h1>
      <p className="mb-8 text-zinc-300">
        Choose the right deployment strategy for your workload. Each strategy trades off between speed, safety, cost, and complexity.
      </p>

      {/* Strategy cards */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        {deploymentStrategies.map((strategy) => (
          <Link
            key={strategy.id}
            href={`/deployment-strategies/${strategy.id}`}
            className="rounded-xl border border-zinc-700 bg-surface-raised p-5 transition-colors hover:border-brand-400/50"
          >
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-semibold text-white">{strategy.name}</h3>
              <span className={`rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] ${complexityColor[strategy.complexity]}`}>
                {strategy.complexity}
              </span>
            </div>
            <p className="mb-3 text-sm text-zinc-300">{strategy.shortDescription}</p>
            <div className="flex flex-wrap gap-2">
              {strategy.bestFor.slice(0, 2).map((use) => (
                <span key={use} className="rounded-full bg-zinc-700 px-2.5 py-0.5 text-xs text-zinc-300">
                  {use}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Comparison matrix */}
      <h2 className="mb-4 text-2xl font-bold text-white">Comparison Matrix</h2>
      <div className="mb-12 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="px-4 py-3 text-left font-medium text-zinc-300">Feature</th>
              {deploymentStrategies.map((s) => (
                <th key={s.id} className="px-4 py-3 text-left font-medium text-brand-400">{s.shortName}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-zinc-200">
            <tr className="border-b border-zinc-700/50">
              <td className="px-4 py-3 text-zinc-300">Downtime</td>
              <td className="px-4 py-3 text-green-400">None</td>
              <td className="px-4 py-3 text-green-400">None</td>
              <td className="px-4 py-3 text-green-400">None</td>
              <td className="px-4 py-3 text-yellow-400">Brief</td>
              <td className="px-4 py-3 text-green-400">None</td>
              <td className="px-4 py-3 text-green-400">None</td>
            </tr>
            <tr className="border-b border-zinc-700/50">
              <td className="px-4 py-3 text-zinc-300">Rollback speed</td>
              <td className="px-4 py-3 text-green-400">Instant</td>
              <td className="px-4 py-3">Fast</td>
              <td className="px-4 py-3">Fast</td>
              <td className="px-4 py-3 text-red-400">Slow</td>
              <td className="px-4 py-3">Fast</td>
              <td className="px-4 py-3 text-green-400">Instant</td>
            </tr>
            <tr className="border-b border-zinc-700/50">
              <td className="px-4 py-3 text-zinc-300">Complexity</td>
              <td className="px-4 py-3 text-yellow-400">Medium</td>
              <td className="px-4 py-3 text-red-400">High</td>
              <td className="px-4 py-3 text-green-400">Low</td>
              <td className="px-4 py-3 text-green-400">Low</td>
              <td className="px-4 py-3 text-red-400">High</td>
              <td className="px-4 py-3 text-red-400">High</td>
            </tr>
            <tr className="border-b border-zinc-700/50">
              <td className="px-4 py-3 text-zinc-300">Resource overhead</td>
              <td className="px-4 py-3 text-red-400">2x</td>
              <td className="px-4 py-3">Low-Med</td>
              <td className="px-4 py-3 text-green-400">Low</td>
              <td className="px-4 py-3 text-green-400">Low</td>
              <td className="px-4 py-3">Medium</td>
              <td className="px-4 py-3 text-red-400">2x</td>
            </tr>
            <tr className="border-b border-zinc-700/50">
              <td className="px-4 py-3 text-zinc-300">Real traffic testing</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3 text-brand-400">Yes</td>
              <td className="px-4 py-3">Partial</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3 text-brand-400">Yes</td>
              <td className="px-4 py-3 text-brand-400">Yes (mirror)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-zinc-300">Best for</td>
              <td className="px-4 py-3">Finance</td>
              <td className="px-4 py-3">SaaS</td>
              <td className="px-4 py-3">Microservices</td>
              <td className="px-4 py-3">GPU / Legacy</td>
              <td className="px-4 py-3">UX experiments</td>
              <td className="px-4 py-3">ML models</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Combo approaches */}
      <h2 className="mb-4 text-2xl font-bold text-white">Combo Approaches</h2>
      <p className="mb-6 text-zinc-300">
        In production, teams often combine strategies for the best of both worlds.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {comboApproaches.map((combo) => (
          <div key={combo.id} className="rounded-xl border border-zinc-700 bg-surface-raised p-4">
            <h3 className="mb-1 font-semibold text-white">{combo.name}</h3>
            <p className="mb-2 text-sm text-zinc-300">{combo.description}</p>
            <span className="text-xs text-brand-400">{combo.bestFor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
