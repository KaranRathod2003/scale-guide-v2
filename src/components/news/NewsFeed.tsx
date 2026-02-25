'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { NewsArticle, NewsTopic, NewsFeedResponse } from '@/types/news';
import NewsCard from './NewsCard';
import NewsFilters from './NewsFilters';
import NewsSkeletonCard from './NewsSkeletonCard';

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<NewsTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchNews = useCallback(
    async (pageNum: number, append: boolean) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (selectedTopics.length > 0) params.set('topics', selectedTopics.join(','));
        if (searchQuery) params.set('q', searchQuery);
        params.set('page', String(pageNum));
        params.set('limit', '20');

        const res = await fetch(`/api/news?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch news');

        const data: NewsFeedResponse = await res.json();

        setArticles((prev) => (append ? [...prev, ...data.articles] : data.articles));
        setHasMore(data.hasMore);
      } catch {
        setError('Failed to load news. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [selectedTopics, searchQuery]
  );

  useEffect(() => {
    setPage(1);
    fetchNews(1, false);
  }, [fetchNews]);

  useEffect(() => {
    if (!observerRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchNews(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchNews]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Live News Feed</h1>
        <p className="text-zinc-400">
          Latest articles on scaling, deployment strategies, and PostgreSQL from across the web.
        </p>
      </div>

      <div className="mb-6">
        <NewsFilters
          selectedTopics={selectedTopics}
          onTopicsChange={setSelectedTopics}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <div key={article.id} className="min-w-0">
            <NewsCard article={article} />
          </div>
        ))}

        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <NewsSkeletonCard key={`skeleton-${i}`} />
          ))}
      </div>

      {!loading && articles.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-zinc-400">No articles found.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Try adjusting your filters or search query.
          </p>
        </div>
      )}

      <div ref={observerRef} className="h-4" />
    </div>
  );
}
