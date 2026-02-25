import type { NewsArticle } from '@/types/news';
import { fetchRSSFeed } from './rss-parser';
import { fetchDevToArticles } from './devto-client';
import { fetchGitHubReleases } from './github-client';
import { RSS_SOURCES } from './sources';

export async function getAggregatedNews(): Promise<NewsArticle[]> {
  const [rssResults, devtoArticles, githubReleases] = await Promise.allSettled([
    Promise.allSettled(RSS_SOURCES.map((s) => fetchRSSFeed(s))).then((results) =>
      results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    ),
    fetchDevToArticles(),
    fetchGitHubReleases(),
  ]);

  const all: NewsArticle[] = [
    ...(rssResults.status === 'fulfilled' ? rssResults.value : []),
    ...(devtoArticles.status === 'fulfilled' ? devtoArticles.value : []),
    ...(githubReleases.status === 'fulfilled' ? githubReleases.value : []),
  ];

  const seen = new Set<string>();
  const deduped = all.filter((article) => {
    const key = article.url.toLowerCase().replace(/\/$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return deduped;
}
