import type { RSSSource, GitHubRepo, NewsTopic } from '@/types/news';

export const RSS_SOURCES: RSSSource[] = [
  {
    id: 'k8s-blog',
    name: 'Kubernetes Blog',
    url: 'https://kubernetes.io/feed.xml',
    defaultTopics: ['scaling', 'deployment'],
    sourceType: 'kubernetes-blog',
  },
  {
    id: 'pg-planet',
    name: 'Planet PostgreSQL',
    url: 'https://planet.postgresql.org/rss20.xml',
    defaultTopics: ['postgresql'],
    sourceType: 'postgresql-planet',
  },
];

export const DEVTO_TAGS = [
  'kubernetes',
  'postgresql',
  'devops',
  'deployment',
  'scaling',
  'postgres',
  'docker',
];

export const GITHUB_REPOS: GitHubRepo[] = [
  { owner: 'kubernetes', repo: 'kubernetes', topics: ['scaling', 'deployment'] },
  { owner: 'postgres', repo: 'postgres', topics: ['postgresql'] },
  { owner: 'kedacore', repo: 'keda', topics: ['scaling'] },
];

export const TOPIC_KEYWORDS: Record<NewsTopic, string[]> = {
  scaling: [
    'autoscal', 'hpa', 'vpa', 'keda', 'scale', 'horizontal pod',
    'vertical pod', 'cluster autoscaler', 'replica', 'load balancing',
    'throughput', 'capacity', 'elastic',
  ],
  deployment: [
    'deploy', 'blue-green', 'canary', 'rolling update', 'rollback',
    'ci/cd', 'gitops', 'argocd', 'flux', 'helm', 'kubernetes deploy',
    'release', 'pipeline', 'continuous delivery',
  ],
  postgresql: [
    'postgres', 'postgresql', 'sql', 'database', 'pgbouncer',
    'connection pool', 'index', 'query optimization', 'vacuum',
    'replication', 'pg_', 'psql',
  ],
};
