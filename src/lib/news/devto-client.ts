import type { NewsArticle } from '@/types/news';
import { classifyTopics } from './topic-classifier';
import { DEVTO_TAGS } from './sources';

interface DevToArticle {
  id: number;
  title: string;
  url: string;
  description: string;
  published_at: string;
  user: { name: string };
  tag_list: string[];
}

export async function fetchDevToArticles(): Promise<NewsArticle[]> {
  try {
    const tagParam = DEVTO_TAGS.slice(0, 5).join(',');
    const res = await fetch(
      `https://dev.to/api/articles?tag=${tagParam}&per_page=15&top=7`,
      {
        next: { revalidate: 900 },
        headers: { 'User-Agent': 'ScaleGuide/1.0 (news-aggregator)' },
      }
    );

    if (!res.ok) return [];

    const articles: DevToArticle[] = await res.json();

    return articles.map((a) => {
      const topics = classifyTopics(
        `${a.title} ${a.description} ${a.tag_list.join(' ')}`,
        []
      );

      return {
        id: `devto-${a.id}`,
        title: a.title,
        url: a.url,
        excerpt: a.description.slice(0, 200),
        publishedAt: a.published_at,
        source: 'devto' as const,
        sourceName: 'Dev.to',
        topics,
        author: a.user.name,
        tags: a.tag_list,
      };
    });
  } catch {
    return [];
  }
}
