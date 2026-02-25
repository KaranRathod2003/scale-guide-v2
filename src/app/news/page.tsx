import type { Metadata } from 'next';
import NewsFeed from '@/components/news/NewsFeed';

export const metadata: Metadata = {
  title: 'Live News Feed | ScaleGuide',
  description: 'Latest articles on Kubernetes scaling, deployment strategies, and PostgreSQL from across the web.',
};

export default function NewsPage() {
  return <NewsFeed />;
}
