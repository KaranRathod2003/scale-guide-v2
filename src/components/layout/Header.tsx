'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { TOPICS } from '@/lib/constants';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    };
  }, []);

  const handleMouseEnter = (index: number) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(index);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-600/50 bg-[#16181d]/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-white">
          Scale<span className="text-brand-400">Guide</span>
          <span className="ml-1.5 rounded-full border border-brand-500/30 bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-brand-400">
            v2
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {TOPICS.map((topic, i) => {
            /* Single-item topics render as direct links (no dropdown) */
            if (topic.items.length === 1) {
              return (
                <Link
                  key={topic.label}
                  href={topic.items[0].href}
                  className="flex shrink-0 items-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60 hover:text-white"
                >
                  {topic.label}
                </Link>
              );
            }

            /* Multi-item topics render as dropdown menus */
            return (
              <div
                key={topic.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    openDropdown === i ? 'bg-zinc-700/60 text-white' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {topic.label}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`transition-transform ${openDropdown === i ? 'rotate-180' : ''}`}
                  >
                    <path d="M3 5l3 3 3-3" />
                  </svg>
                </button>

                {openDropdown === i && (
                  <div className={`absolute top-full z-50 mt-1 w-64 rounded-xl border border-zinc-600/50 bg-[#1e2028] p-2 shadow-2xl shadow-black/40 ${
                    i >= TOPICS.length - 2 ? 'right-0' : 'left-0'
                  }`}>
                    {topic.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="group flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-700/60"
                      >
                        <span className="text-sm font-medium text-zinc-200 group-hover:text-white">
                          {item.label}
                        </span>
                        <span className="text-xs text-zinc-400 group-hover:text-zinc-300">
                          {item.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`h-0.5 w-6 bg-zinc-400 transition-transform ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-zinc-400 transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-zinc-400 transition-transform ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-zinc-600/50 bg-[#16181d] px-4 py-4 md:hidden">
          {TOPICS.map((topic) => (
            <div key={topic.label} className="mb-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                {topic.label}
              </span>
              {topic.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60 hover:text-white"
                >
                  {item.label}
                  <span className="ml-2 text-xs text-zinc-400">{item.description}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
