'use client';

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  readOnly?: boolean;
}

export default function QueryEditor({ value, onChange, onRun, readOnly = false }: QueryEditorProps) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between rounded-t-lg bg-zinc-700 px-4 py-2">
        <span className="text-xs text-zinc-400">SQL</span>
        {onRun && (
          <span className="text-[10px] text-zinc-500">Ctrl+Enter to run</span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (onRun && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRun();
          }
        }}
        readOnly={readOnly}
        rows={6}
        spellCheck={false}
        className="w-full rounded-b-lg bg-zinc-800 p-4 font-mono text-sm leading-relaxed text-zinc-200 outline-none placeholder-zinc-600 focus:ring-1 focus:ring-brand-400/50"
        placeholder="Write your SQL query here..."
      />
    </div>
  );
}
