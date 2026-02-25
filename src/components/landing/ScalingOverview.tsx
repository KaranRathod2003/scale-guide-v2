'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { scalingApproaches } from '@/lib/scaling-data';

const icons: Record<string, React.ReactNode> = {
  hpa: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="8" width="6" height="8" rx="1" />
      <rect x="15" y="8" width="6" height="8" rx="1" />
      <path d="M9 12h6M13 10l2 2-2 2" />
    </svg>
  ),
  vpa: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="7" y="3" width="10" height="18" rx="1" />
      <path d="M12 15V9M10 11l2-2 2 2" />
    </svg>
  ),
  'cluster-autoscaler': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="8" height="8" rx="1" />
      <rect x="14" y="2" width="8" height="8" rx="1" />
      <rect x="2" y="14" width="8" height="8" rx="1" />
      <rect x="14" y="14" width="8" height="8" rx="1" strokeDasharray="3 2" />
    </svg>
  ),
  keda: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ScalingOverview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 text-center sm:mb-12"
      >
        <span className="mb-3 inline-block rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">Hot Topic</span>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Kubernetes Autoscaling</h2>
        <p className="mt-3 max-w-2xl mx-auto text-zinc-200">
          Official docs tell you what each autoscaler does. We show you when Hotstar handled 25M cricket viewers,
          when Netflix evening traffic doubles, and why choosing wrong costs real money.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-6 sm:grid-cols-2"
      >
        {scalingApproaches.map((approach) => (
          <motion.div key={approach.id} variants={itemVariants}>
            <Link href={`/docs/${approach.id}`}>
              <Card>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
                    {icons[approach.id]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{approach.name}</h3>
                    <span className="text-xs text-zinc-300">{approach.layer} level</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-200">{approach.shortDescription}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {approach.bestFor.slice(0, 3).map((use) => (
                    <span
                      key={use}
                      className="rounded-full bg-zinc-600/30 px-2.5 py-0.5 text-xs text-zinc-300"
                    >
                      {use}
                    </span>
                  ))}
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
