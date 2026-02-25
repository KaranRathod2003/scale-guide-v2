import NewsSkeletonCard from '@/components/news/NewsSkeletonCard';

export default function NewsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 h-8 w-48 animate-pulse rounded bg-zinc-700" />
        <div className="h-4 w-80 animate-pulse rounded bg-zinc-700" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <NewsSkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
