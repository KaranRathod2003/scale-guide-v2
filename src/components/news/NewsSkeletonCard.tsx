'use client';

export default function NewsSkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-600/40 bg-surface-raised p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-16 rounded-full bg-zinc-700" />
        <div className="h-3 w-12 rounded bg-zinc-700" />
      </div>
      <div className="mb-2 h-4 w-3/4 rounded bg-zinc-700" />
      <div className="mb-1 h-3 w-full rounded bg-zinc-700" />
      <div className="mb-3 h-3 w-2/3 rounded bg-zinc-700" />
      <div className="flex gap-1.5">
        <div className="h-4 w-14 rounded-full bg-zinc-700" />
        <div className="h-4 w-18 rounded-full bg-zinc-700" />
      </div>
    </div>
  );
}
