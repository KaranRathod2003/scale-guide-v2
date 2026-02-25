import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="mb-2 text-6xl font-bold text-white">404</h1>
      <p className="mb-6 text-zinc-300">Page not found</p>
      <Link
        href="/"
        className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600"
      >
        Back to Home
      </Link>
    </div>
  );
}
