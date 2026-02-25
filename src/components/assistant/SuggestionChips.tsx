'use client';

import { motion } from 'framer-motion';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (value: string) => void;
}

export default function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  return (
    <div className="border-t border-zinc-700 px-4 py-2">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <motion.button
            key={suggestion}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(suggestion)}
            className="rounded-full border border-zinc-600 bg-surface-raised px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:border-brand-400 hover:text-brand-400"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
