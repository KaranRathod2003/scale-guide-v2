'use client';

import type { NewsTopic } from '@/types/news';

const TOPIC_OPTIONS: { value: NewsTopic | 'all'; label: string }[] = [
  { value: 'all', label: 'All Topics' },
  { value: 'scaling', label: 'Scaling' },
  { value: 'deployment', label: 'Deployments' },
  { value: 'postgresql', label: 'PostgreSQL' },
];

interface NewsFiltersProps {
  selectedTopics: NewsTopic[];
  onTopicsChange: (topics: NewsTopic[]) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function NewsFilters({
  selectedTopics,
  onTopicsChange,
  searchQuery,
  onSearchChange,
}: NewsFiltersProps) {
  const handleTopicClick = (value: NewsTopic | 'all') => {
    if (value === 'all') {
      onTopicsChange([]);
    } else {
      const isSelected = selectedTopics.includes(value);
      if (isSelected) {
        onTopicsChange(selectedTopics.filter((t) => t !== value));
      } else {
        onTopicsChange([...selectedTopics, value]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TOPIC_OPTIONS.map((opt) => {
          const isActive =
            opt.value === 'all'
              ? selectedTopics.length === 0
              : selectedTopics.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => handleTopicClick(opt.value)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 sm:w-64"
        />
      </div>
    </div>
  );
}
