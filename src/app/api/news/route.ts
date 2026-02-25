import { NextRequest, NextResponse } from 'next/server';
import { getAggregatedNews } from '@/lib/news/aggregator';
import { getCachedOrFetch } from '@/lib/news/cache';
import type { NewsTopic } from '@/types/news';

const VALID_TOPICS: NewsTopic[] = ['scaling', 'deployment', 'postgresql'];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topicsParam = searchParams.get('topics');
  const query = searchParams.get('q') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  const articles = await getCachedOrFetch(
    'news-feed',
    () => getAggregatedNews(),
    { ttlMs: 15 * 60 * 1000 }
  );

  let filtered = articles;

  if (topicsParam) {
    const topics = topicsParam.split(',').filter((t): t is NewsTopic =>
      VALID_TOPICS.includes(t as NewsTopic)
    );
    if (topics.length > 0) {
      filtered = filtered.filter((a) =>
        topics.some((t) => a.topics.includes(t))
      );
    }
  }

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q)
    );
  }

  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return NextResponse.json(
    {
      articles: paged,
      total: filtered.length,
      page,
      hasMore: start + limit < filtered.length,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}
