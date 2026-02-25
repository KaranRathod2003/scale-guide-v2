import type { NewsTopic } from '@/types/news';
import { TOPIC_KEYWORDS } from './sources';

export function classifyTopics(
  text: string,
  defaultTopics: NewsTopic[]
): NewsTopic[] {
  const lower = text.toLowerCase();
  const matched = new Set<NewsTopic>(defaultTopics);

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS) as [NewsTopic, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        matched.add(topic);
        break;
      }
    }
  }

  if (matched.size === 0) {
    return defaultTopics.length > 0 ? defaultTopics : ['scaling'];
  }

  return Array.from(matched);
}
