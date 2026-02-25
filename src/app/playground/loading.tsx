export default function PlaygroundLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 h-8 w-40 animate-pulse rounded bg-zinc-700" />
        <div className="h-4 w-72 animate-pulse rounded bg-zinc-700" />
      </div>
      <div className="mb-8 h-12 animate-pulse rounded-xl bg-zinc-800" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="h-[400px] animate-pulse rounded-lg bg-zinc-800" />
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-[200px] animate-pulse rounded-lg bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
