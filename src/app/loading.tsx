export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo mark */}
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-ping rounded-full bg-brand-400/20" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-brand-400/10" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-brand-400/30 bg-surface-raised">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="animate-pulse text-brand-400"
            >
              <path
                d="M10 2 L16 6 L16 14 L10 18 L4 14 L4 6 Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M10 2 L10 18 M4 6 L16 14 M16 6 L4 14"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.4"
              />
            </svg>
          </div>
        </div>

        {/* Skeleton content lines */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-2 w-32 animate-pulse rounded-full bg-zinc-700/60" />
          <div className="h-2 w-20 animate-pulse rounded-full bg-zinc-700/40" />
        </div>
      </div>
    </div>
  );
}
