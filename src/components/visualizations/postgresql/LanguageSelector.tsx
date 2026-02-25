'use client';

import type { ProgrammingLanguage } from '@/types/postgresql';

const languages: { id: ProgrammingLanguage; label: string }[] = [
  { id: 'nodejs', label: 'Node.js' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
];

interface LanguageSelectorProps {
  selected: ProgrammingLanguage;
  onChange: (lang: ProgrammingLanguage) => void;
}

export default function LanguageSelector({ selected, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-zinc-800 p-1">
      {languages.map((lang) => (
        <button
          key={lang.id}
          onClick={() => onChange(lang.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            selected === lang.id
              ? 'bg-brand-500/20 text-brand-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
