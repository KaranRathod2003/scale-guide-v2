'use client';

import { useState } from 'react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-white"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
