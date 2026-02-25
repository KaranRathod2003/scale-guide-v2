import type { NewsArticle, RSSSource } from '@/types/news';
import { classifyTopics } from './topic-classifier';

function extractTag(xml: string, tag: string): string {
  const openTag = `<${tag}`;
  const closeTag = `</${tag}>`;
  const startIdx = xml.indexOf(openTag);
  if (startIdx === -1) return '';
  const contentStart = xml.indexOf('>', startIdx) + 1;
  const endIdx = xml.indexOf(closeTag, contentStart);
  if (endIdx === -1) return '';
  return xml
    .slice(contentStart, endIdx)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function splitItems(xml: string): string[] {
  const items: string[] = [];
  // Try <item> first (RSS 2.0)
  let cursor = 0;
  while (true) {
    const start = xml.indexOf('<item', cursor);
    if (start === -1) break;
    const end = xml.indexOf('</item>', start);
    if (end === -1) break;
    items.push(xml.slice(start, end + 7));
    cursor = end + 7;
  }
  // Try <entry> (Atom)
  if (items.length === 0) {
    cursor = 0;
    while (true) {
      const start = xml.indexOf('<entry', cursor);
      if (start === -1) break;
      const end = xml.indexOf('</entry>', start);
      if (end === -1) break;
      items.push(xml.slice(start, end + 8));
      cursor = end + 8;
    }
  }
  return items;
}

function extractLink(itemXml: string): string {
  // Atom-style: <link href="..." />
  const hrefMatch = itemXml.match(/href=["']([^"']+)["']/i);
  if (hrefMatch) return hrefMatch[1];
  return extractTag(itemXml, 'link');
}

export async function fetchRSSFeed(source: RSSSource): Promise<NewsArticle[]> {
  try {
    const res = await fetch(source.url, {
      next: { revalidate: 900 },
      headers: { 'User-Agent': 'ScaleGuide/1.0 (news-aggregator)' },
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const items = splitItems(xml).slice(0, 15);

    return items
      .map((itemXml) => {
        const title = stripHtml(extractTag(itemXml, 'title'));
        const url = extractLink(itemXml);
        const description =
          extractTag(itemXml, 'description') ||
          extractTag(itemXml, 'summary') ||
          extractTag(itemXml, 'content');
        const excerpt = stripHtml(description).slice(0, 200);
        const pubDate =
          extractTag(itemXml, 'pubDate') ||
          extractTag(itemXml, 'published') ||
          extractTag(itemXml, 'updated');
        const author =
          extractTag(itemXml, 'author') ||
          extractTag(itemXml, 'dc:creator');

        const topics = classifyTopics(title + ' ' + excerpt, source.defaultTopics);

        return {
          id: `rss-${source.id}-${hashString(url || title)}`,
          title,
          url,
          excerpt,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source: source.sourceType,
          sourceName: source.name,
          topics,
          author: stripHtml(author) || undefined,
        };
      })
      .filter((a) => a.title && a.url);
  } catch {
    return [];
  }
}
