'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { postgresTopics } from '@/lib/postgresql-data';

const topicIcons: Record<string, React.ReactNode> = {
  setup: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83" />
    </svg>
  ),
  why: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9a3 3 0 016 0c0 2-3 2.5-3 4.5M12 17v.5" />
    </svg>
  ),
  connections: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="8" width="7" height="7" rx="1" />
      <rect x="15" y="8" width="7" height="7" rx="1" />
      <path d="M9 11.5h6" />
      <circle cx="12" cy="11.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  practice: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h4" />
    </svg>
  ),
  docs: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 5a1 1 0 011-1h4l2 2h8a1 1 0 011 1v11a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
      <path d="M8 11h8M8 14h5" />
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

export default function PostgreSQLOverview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 text-center sm:mb-12"
      >
        <span className="mb-3 inline-block rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">New Topic</span>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">PostgreSQL</h2>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-200">
          From installation to production backends. Learn how Apple, Instagram, and Goldman Sachs use PostgreSQL
          at scale -- with animated connection flows and hands-on SQL exercises.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {postgresTopics.slice(0, 3).map((topic) => (
          <motion.div key={topic.slug} variants={itemVariants}>
            <Link href={`/postgresql/${topic.slug}`}>
              <Card>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
                    {topicIcons[topic.icon]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{topic.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-zinc-200">{topic.description}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 text-center"
      >
        <Link
          href="/postgresql"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-400 hover:text-white"
        >
          View all PostgreSQL topics
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 3l4 4-4 4" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}
