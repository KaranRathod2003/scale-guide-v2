import Link from 'next/link';
import { postgresTopics, enterpriseUseCases } from '@/lib/postgresql-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PostgreSQL',
  description: 'Complete PostgreSQL learning path: setup, backend connections, practice exercises, and official docs summary.',
};

const topicIcons: Record<string, React.ReactNode> = {
  setup: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 2v4M10 14v4M2 10h4M14 10h4M4.93 4.93l2.83 2.83M12.24 12.24l2.83 2.83M4.93 15.07l2.83-2.83M12.24 7.76l2.83-2.83" />
    </svg>
  ),
  why: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="8" />
      <path d="M7.5 7.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M10 14v.5" />
    </svg>
  ),
  connections: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="7" width="6" height="6" rx="1" />
      <rect x="13" y="7" width="6" height="6" rx="1" />
      <path d="M7 10h6" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    </svg>
  ),
  practice: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="2" width="14" height="16" rx="2" />
      <path d="M7 6h6M7 10h6M7 14h3" />
    </svg>
  ),
  docs: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4a1 1 0 011-1h4l2 2h6a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
      <path d="M7 10h6M7 13h4" />
    </svg>
  ),
};

export default function PostgreSQLIndex() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">PostgreSQL</h1>
      <p className="mb-8 text-zinc-300">
        A structured learning path from installation to production-ready backends.
        Follow these chapters in order or jump to the topic you need.
      </p>

      {/* Learning path cards */}
      <h2 className="mb-4 text-2xl font-bold text-white">Learning Path</h2>
      <div className="mb-12 space-y-3">
        {postgresTopics.map((topic, i) => (
          <Link
            key={topic.slug}
            href={`/postgresql/${topic.slug}`}
            className="group flex items-start gap-4 rounded-xl border border-zinc-700 bg-surface-raised p-5 transition-colors hover:border-brand-400/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
              {topicIcons[topic.icon]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
                  Chapter {i + 1}
                </span>
                <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">{topic.title}</h3>
              </div>
              <p className="text-sm text-zinc-300">{topic.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Why PostgreSQL summary */}
      <h2 className="mb-4 text-2xl font-bold text-white">Why PostgreSQL?</h2>
      <p className="mb-6 text-zinc-300">
        Used by the world&apos;s largest companies for mission-critical workloads.
      </p>
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enterpriseUseCases.slice(0, 6).map((uc) => (
          <div key={uc.company} className="rounded-xl border border-zinc-700 bg-surface-raised p-4">
            <h3 className="mb-1 font-semibold text-brand-400">{uc.company}</h3>
            <p className="mb-2 text-sm text-zinc-300">{uc.useCase}</p>
            <span className="text-xs text-zinc-400">{uc.scale}</span>
          </div>
        ))}
      </div>

      {/* Feature highlights */}
      <h2 className="mb-4 text-2xl font-bold text-white">What You&apos;ll Learn</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { title: 'Animated Connection Flows', desc: 'Watch how your app talks to PostgreSQL step by step -- DNS, TCP, auth, query, response.', color: 'text-sky-400 bg-sky-500/10' },
          { title: 'Hands-On SQL Practice', desc: 'Pre-built exercises with hints and solutions. From basic SELECTs to window functions and CTEs.', color: 'text-emerald-400 bg-emerald-500/10' },
          { title: 'Production Best Practices', desc: 'Connection pooling, configuration tuning, backup strategies, and replication patterns.', color: 'text-amber-400 bg-amber-500/10' },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${f.color}`}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-white">{f.title}</h3>
            <p className="text-sm text-zinc-300">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
