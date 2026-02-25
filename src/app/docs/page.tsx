import Link from 'next/link';
import { scalingApproaches } from '@/lib/scaling-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Complete guide to Kubernetes autoscaling: HPA, VPA, Cluster Autoscaler, and KEDA.',
};

export default function DocsIndex() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Autoscaling Documentation</h1>
      <p className="mb-8 text-zinc-300">
        Everything you need to understand, choose, and implement Kubernetes autoscaling.
      </p>

      {/* Quick links */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        {scalingApproaches.map((approach) => (
          <Link
            key={approach.id}
            href={`/docs/${approach.id}`}
            className="rounded-xl border border-zinc-700 bg-surface-raised p-5 transition-colors hover:border-brand-400/50"
          >
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-semibold text-white">{approach.name}</h3>
              <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">{approach.complexity}</span>
            </div>
            <p className="text-sm text-zinc-300">{approach.shortDescription}</p>
          </Link>
        ))}
      </div>

      {/* Comparison matrix */}
      <h2 className="mb-4 text-2xl font-bold text-white">Comparison Matrix</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="px-4 py-3 text-left font-medium text-zinc-300">Feature</th>
              {scalingApproaches.map((a) => (
                <th key={a.id} className="px-4 py-3 text-left font-medium text-brand-400">{a.shortName}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-zinc-200">
            <tr className="border-b border-zinc-700/50">
              <td className="px-4 py-3 text-zinc-300">What it scales</td>
              <td className="px-4 py-3">Pod replicas</td>
              <td className="px-4 py-3">Pod resources</td>
              <td className="px-4 py-3">Cluster nodes</td>
              <td className="px-4 py-3">Pod replicas (event)</td>
            </tr>
            <tr className="border-b border-zinc-700/50">
              <td className="px-4 py-3 text-zinc-300">Direction</td>
              <td className="px-4 py-3">Horizontal</td>
              <td className="px-4 py-3">Vertical</td>
              <td className="px-4 py-3">Horizontal (infra)</td>
              <td className="px-4 py-3">Horizontal</td>
            </tr>
            <tr className="border-b border-zinc-700/50">
              <td className="px-4 py-3 text-zinc-300">Scale to zero</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">Yes (nodes)</td>
              <td className="px-4 py-3 text-brand-400">Yes</td>
            </tr>
            <tr className="border-b border-zinc-700/50">
              <td className="px-4 py-3 text-zinc-300">Built-in to K8s</td>
              <td className="px-4 py-3 text-brand-400">Yes</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
            </tr>
            <tr className="border-b border-zinc-700/50">
              <td className="px-4 py-3 text-zinc-300">Complexity</td>
              <td className="px-4 py-3 text-green-400">Low</td>
              <td className="px-4 py-3 text-yellow-400">Medium</td>
              <td className="px-4 py-3 text-yellow-400">Medium</td>
              <td className="px-4 py-3 text-yellow-400">Medium</td>
            </tr>
            <tr className="border-b border-zinc-700/50">
              <td className="px-4 py-3 text-zinc-300">Reaction time</td>
              <td className="px-4 py-3">15-60s</td>
              <td className="px-4 py-3">Minutes</td>
              <td className="px-4 py-3">2-10 min</td>
              <td className="px-4 py-3">10-30s</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-zinc-300">Best for</td>
              <td className="px-4 py-3">Web APIs</td>
              <td className="px-4 py-3">Databases</td>
              <td className="px-4 py-3">Infra elasticity</td>
              <td className="px-4 py-3">Queue consumers</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
