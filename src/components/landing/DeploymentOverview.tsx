'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { deploymentStrategies } from '@/lib/deployment-data';

const icons: Record<string, React.ReactNode> = {
  'blue-green': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="6" width="8" height="12" rx="1" />
      <rect x="14" y="6" width="8" height="12" rx="1" />
      <path d="M10 12h4M12 10l2 2-2 2" />
    </svg>
  ),
  canary: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="7" height="16" rx="1" />
      <rect x="14" y="10" width="7" height="10" rx="1" strokeDasharray="3 2" />
      <path d="M10 12h4" />
    </svg>
  ),
  'rolling-update': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="8" r="3" />
      <circle cx="12" cy="8" r="3" />
      <circle cx="18" cy="8" r="3" />
      <path d="M6 14v4M12 14v4M18 14v4" />
      <path d="M9 18l3-3 3 3" />
    </svg>
  ),
  recreate: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6h16M4 6l2 14h12l2-14" />
      <path d="M9 3h6" />
      <path d="M10 10v6M14 10v6" />
    </svg>
  ),
  'ab-testing': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <text x="4" y="16" fontSize="12" fontWeight="bold" fill="currentColor" stroke="none">A</text>
      <text x="14" y="16" fontSize="12" fontWeight="bold" fill="currentColor" stroke="none">B</text>
      <path d="M12 4v16" strokeDasharray="3 2" />
    </svg>
  ),
  shadow: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="8" height="14" rx="1" />
      <rect x="13" y="5" width="8" height="14" rx="1" strokeDasharray="3 2" opacity="0.5" />
      <path d="M11 12h2" strokeDasharray="2 2" />
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

export default function DeploymentOverview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 text-center sm:mb-12"
      >
        <span className="mb-3 inline-block rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">Hot Topic</span>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Deployment Strategies</h2>
        <p className="mt-3 max-w-2xl mx-auto text-zinc-200">
          Everyone knows &quot;blue-green&quot; and &quot;canary&quot; as buzzwords. We show you the $2.3M failure when Shopify skipped
          business metrics, and how Delta validated pricing models for 3 weeks with zero user risk.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {deploymentStrategies.map((strategy) => (
          <motion.div key={strategy.id} variants={itemVariants}>
            <Link href={`/deployment-strategies/${strategy.id}`}>
              <Card>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
                    {icons[strategy.id]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{strategy.name}</h3>
                    <span className="text-xs text-zinc-300">{strategy.complexity} complexity</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-200">{strategy.shortDescription}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {strategy.bestFor.slice(0, 2).map((use) => (
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
