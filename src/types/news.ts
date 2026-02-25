export type NewsTopic = 'scaling' | 'deployment' | 'postgresql';

export type NewsSource =
  | 'kubernetes-blog'
  | 'postgresql-planet'
  | 'devto'
  | 'github-releases';

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  publishedAt: string;
  source: NewsSource;
  sourceName: string;
  topics: NewsTopic[];
  author?: string;
  tags?: string[];
}

export interface NewsFeedResponse {
  articles: NewsArticle[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface NewsFiltersState {
  topics: NewsTopic[];
  query: string;
  page: number;
}

export interface RSSSource {
  id: string;
  name: string;
  url: string;
  defaultTopics: NewsTopic[];
  sourceType: NewsSource;
}

export interface GitHubRepo {
  owner: string;
  repo: string;
  topics: NewsTopic[];
}
