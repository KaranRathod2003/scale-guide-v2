'use client';

import { motion } from 'framer-motion';

const features = [
  {
    title: 'Real-World War Stories',
    description: 'Every topic includes failure and success scenarios from companies like Netflix, Uber, Target, and Delta Airlines. Not theory -- what actually happened.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 2a6 6 0 014 10.5V15a1 1 0 01-1 1H7a1 1 0 01-1-1v-2.5A6 6 0 0110 2z" />
        <path d="M8 18h4" />
      </svg>
    ),
  },
  {
    title: 'Interactive Playgrounds',
    description: 'Watch deployments, scaling, and database connections happen step by step. Trigger failures, see cascading errors, then replay the success path. Learn by seeing, not reading.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8" />
        <polygon points="8,6 14,10 8,14" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'AI That Knows Trade-offs',
    description: 'Describe your workload, stack, and constraints. Our assistant recommends the right approach with specific warnings about what can go wrong.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 8l-4 4 4 4M14 8l4 4-4 4M11 4l-2 14" />
      </svg>
    ),
  },
];

export default function FeatureHighlights() {
  return (
    <section className="border-t border-zinc-600/30 bg-gradient-to-b from-surface-raised/60 to-transparent">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center sm:mb-12"
        >
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Why ScaleGuide?</h2>
          <p className="mt-3 text-zinc-200">
            Because some topics need more than docs and Stack Overflow.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                i === 0 ? 'bg-amber-500/10 text-amber-400' :
                i === 1 ? 'bg-sky-500/10 text-sky-400' :
                'bg-violet-500/10 text-violet-400'
              }`}>
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-zinc-200">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
