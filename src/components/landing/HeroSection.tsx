'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#34d399" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 inline-block rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400"
          >
            Complex topics. One platform.
          </motion.div>

          <h1 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl">
            Topics that docs, Google & AI{' '}
            <span className="text-brand-400">can&apos;t explain well.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-200 sm:mt-6 sm:text-lg">
            Some engineering topics are too complex for official docs, too nuanced for a Google search,
            and too hands-on for AI to explain in words. We give you real-world failure &amp; success
            stories, interactive playgrounds, and an AI that actually understands the trade-offs.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/docs"
              className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              Explore Autoscaling
            </Link>
            <Link
              href="/deployment-strategies"
              className="rounded-lg border border-zinc-600 px-6 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-400 hover:text-white"
            >
              Explore Deployments
            </Link>
            <Link
              href="/postgresql"
              className="rounded-lg border border-zinc-600 px-6 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-400 hover:text-white"
            >
              Explore PostgreSQL
            </Link>
          </div>
        </motion.div>

        {/* Mini preview animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mx-auto mt-16 max-w-3xl"
        >
          <TopicPreview />
        </motion.div>
      </div>
    </section>
  );
}

function TopicPreview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Autoscaling preview */}
      <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-surface-raised p-4 sm:rounded-2xl sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-brand-400" />
          <span className="text-xs font-medium text-brand-400">Autoscaling</span>
        </div>
        <div className="mb-3 flex items-center justify-center gap-2 py-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: i < 3 ? 1 : 0.3, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.15, type: 'spring', stiffness: 300 }}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                i < 3
                  ? 'border-brand-400/50 bg-brand-500/10 text-brand-400'
                  : 'border-dashed border-zinc-600 bg-zinc-600/30 text-zinc-400'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" />
              </svg>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-zinc-300">
          Watch Hotstar handle 25M cricket viewers with HPA + Cluster Autoscaler
        </p>
      </div>

      {/* Deployment preview */}
      <div className="rounded-xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-surface-raised p-4 sm:rounded-2xl sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Deployments</span>
        </div>
        <div className="mb-3 flex items-center justify-center gap-4 py-3">
          {/* Blue env */}
          <div className="flex gap-1.5">
            {[0, 1].map((i) => (
              <motion.div
                key={`blue-${i}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1, type: 'spring', stiffness: 300 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-400/50 bg-blue-500/10 text-blue-400"
              >
                <span className="text-[9px] font-mono font-bold">v1</span>
              </motion.div>
            ))}
          </div>
          {/* Arrow */}
          <motion.svg
            width="24" height="24" viewBox="0 0 24 24" fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <path d="M5 12h14M13 6l6 6-6 6" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
          {/* Green env */}
          <div className="flex gap-1.5">
            {[0, 1].map((i) => (
              <motion.div
                key={`green-${i}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.4, scale: 1 }}
                transition={{ delay: 1.0 + i * 0.1, type: 'spring', stiffness: 300 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-green-400/50 bg-green-500/10 text-green-400"
              >
                <span className="text-[9px] font-mono font-bold">v2</span>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="text-xs text-zinc-300">
          See how Netflix does 36-hour canary rollouts with zero user impact
        </p>
      </div>
    </div>
  );
}
