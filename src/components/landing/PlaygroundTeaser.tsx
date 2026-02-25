'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const SANDBOX_PREVIEWS = [
  {
    label: 'SQL Queries',
    code: `SELECT department, COUNT(*) as count
FROM employees
GROUP BY department
HAVING COUNT(*) > 2;`,
    color: 'text-emerald-400',
  },
  {
    label: 'K8s Manifests',
    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3`,
    color: 'text-purple-400',
  },
  {
    label: 'Deploy Configs',
    code: `strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0`,
    color: 'text-amber-400',
  },
];

export default function PlaygroundTeaser() {
  return (
    <section className="border-t border-zinc-600/40 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
            Interactive Code Sandbox
          </h2>
          <p className="text-zinc-400">
            Practice SQL, Kubernetes manifests, and deployment configs with instant validation.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-3">
          {SANDBOX_PREVIEWS.map((preview, i) => (
            <motion.div
              key={preview.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-zinc-600/40 bg-surface-raised p-5"
            >
              <div className={`mb-3 text-xs font-semibold uppercase tracking-wider ${preview.color}`}>
                {preview.label}
              </div>
              <pre className="rounded-lg bg-zinc-800/80 p-3 text-xs leading-relaxed text-zinc-300">
                <code>{preview.code}</code>
              </pre>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Open Code Sandbox
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
