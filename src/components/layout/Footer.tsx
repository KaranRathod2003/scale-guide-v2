import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-600/40 bg-[#16181d]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-zinc-400">
            <Link href="/" className="font-semibold text-white">
              Scale<span className="text-brand-400">Guide</span>
            </Link>
            {' '}&mdash; Kubernetes Autoscaling, Explained Visually.
          </div>
          <div className="flex gap-6 text-sm text-zinc-400">
            <Link href="/docs" className="transition-colors hover:text-zinc-200">Docs</Link>
            <Link href="/visualize" className="transition-colors hover:text-zinc-200">Visualize</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
