'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { NewsArticle } from '@/types/news';
import NewsSourceBadge from '@/components/news/NewsSourceBadge';

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NewsTeaser() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/news?limit=3')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (loaded && articles.length === 0) return null;

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
            Latest from the Community
          </h2>
          <p className="text-zinc-400">
            Stay updated with the latest articles on scaling, deployments, and PostgreSQL.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {!loaded
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-xl bg-zinc-800" />
              ))
            : articles.map((article, i) => (
                <motion.a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-zinc-600/40 bg-surface-raised p-5 transition-colors hover:border-brand-400/50"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <NewsSourceBadge source={article.source} />
                    <span className="text-xs text-zinc-500">{timeAgo(article.publishedAt)}</span>
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-zinc-100">
                    {article.title}
                  </h3>
                  <p className="line-clamp-2 text-xs text-zinc-400">{article.excerpt}</p>
                </motion.a>
              ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
          >
            View All News
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
