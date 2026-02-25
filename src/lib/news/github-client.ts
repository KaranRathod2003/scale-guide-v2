import type { NewsArticle, GitHubRepo } from '@/types/news';
import { GITHUB_REPOS } from './sources';

interface GitHubRelease {
  id: number;
  name: string;
  tag_name: string;
  html_url: string;
  body: string;
  published_at: string;
  author: { login: string };
}

async function fetchRepoReleases(repo: GitHubRepo): Promise<NewsArticle[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases?per_page=5`,
      {
        next: { revalidate: 900 },
        headers: {
          'User-Agent': 'ScaleGuide/1.0 (news-aggregator)',
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (!res.ok) return [];

    const releases: GitHubRelease[] = await res.json();

    return releases.map((r) => {
      const body = (r.body || '')
        .replace(/[#*`\[\]()]/g, '')
        .slice(0, 200);

      return {
        id: `gh-${repo.owner}-${repo.repo}-${r.id}`,
        title: `${repo.owner}/${repo.repo} ${r.name || r.tag_name}`,
        url: r.html_url,
        excerpt: body || `New release ${r.tag_name} for ${repo.owner}/${repo.repo}`,
        publishedAt: r.published_at,
        source: 'github-releases' as const,
        sourceName: 'GitHub Releases',
        topics: repo.topics,
        author: r.author.login,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchGitHubReleases(): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(
    GITHUB_REPOS.map((repo) => fetchRepoReleases(repo))
  );

  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}
