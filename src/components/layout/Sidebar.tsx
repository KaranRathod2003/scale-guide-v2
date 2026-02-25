'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOC_NAV, DEPLOYMENT_NAV, POSTGRESQL_NAV, PLAYGROUND_NAV } from '@/lib/constants';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-600/40 lg:block">
      <div className="sticky top-16 space-y-8 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        {/* Autoscaling section */}
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {DOC_NAV.title}
          </h3>
          <nav className="flex flex-col gap-1">
            {DOC_NAV.items.map((item) => {
              const href = `/docs/${item.slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={item.slug}
                  href={href}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-500/10 font-medium text-brand-400'
                      : 'text-zinc-300 hover:bg-zinc-600/30 hover:text-white'
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Deployment Strategies section */}
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {DEPLOYMENT_NAV.title}
          </h3>
          <nav className="flex flex-col gap-1">
            {DEPLOYMENT_NAV.items.map((item) => {
              const href = `/deployment-strategies/${item.slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={item.slug}
                  href={href}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-500/10 font-medium text-brand-400'
                      : 'text-zinc-300 hover:bg-zinc-600/30 hover:text-white'
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* PostgreSQL section */}
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {POSTGRESQL_NAV.title}
          </h3>
          <nav className="flex flex-col gap-1">
            {POSTGRESQL_NAV.items.map((item) => {
              const href = `/postgresql/${item.slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={item.slug}
                  href={href}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-500/10 font-medium text-brand-400'
                      : 'text-zinc-300 hover:bg-zinc-600/30 hover:text-white'
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Code Sandbox section */}
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {PLAYGROUND_NAV.title}
          </h3>
          <nav className="flex flex-col gap-1">
            {PLAYGROUND_NAV.items.map((item) => {
              const href = `/playground?tab=${item.slug}`;
              const isActive = pathname === '/playground' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === item.slug;
              return (
                <Link
                  key={item.slug}
                  href={href}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-500/10 font-medium text-brand-400'
                      : 'text-zinc-300 hover:bg-zinc-600/30 hover:text-white'
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
