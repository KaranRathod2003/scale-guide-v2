'use client';

import { motion } from 'framer-motion';
import type { NewsArticle } from '@/types/news';
import NewsSourceBadge from './NewsSourceBadge';

const TOPIC_COLORS: Record<string, string> = {
  scaling: 'bg-brand-500/20 text-brand-300',
  deployment: 'bg-amber-500/20 text-amber-300',
  postgresql: 'bg-indigo-500/20 text-indigo-300',
};

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-600/40 bg-surface-raised p-5 transition-colors hover:border-brand-400/50 hover:bg-zinc-800/80"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <NewsSourceBadge source={article.source} />
        <span className="text-xs text-zinc-500">{timeAgo(article.publishedAt)}</span>
      </div>

      <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-zinc-100">
        {article.title}
      </h3>

      <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-zinc-400">
        {article.excerpt}
      </p>

      <div className="mt-auto flex flex-wrap gap-1.5">
        {article.topics.map((topic) => (
          <span
            key={topic}
            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${TOPIC_COLORS[topic] || 'bg-zinc-500/20 text-zinc-400'}`}
          >
            {topic}
          </span>
        ))}
      </div>

      {article.author && (
        <p className="mt-3 text-[10px] text-zinc-500">by {article.author}</p>
      )}
    </motion.a>
  );
}
