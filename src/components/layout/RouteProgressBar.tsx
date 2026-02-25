'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const prevUrl = useRef('');

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const url = pathname + searchParams.toString();

    // Skip initial mount
    if (!prevUrl.current) {
      prevUrl.current = url;
      return;
    }

    // Same URL — no navigation
    if (url === prevUrl.current) return;
    prevUrl.current = url;

    cleanup();

    // Start the bar
    setProgress(0);
    setVisible(true);

    // Quickly jump to ~30%, then crawl
    timerRef.current = setTimeout(() => {
      setProgress(30);

      // Slowly crawl toward 85% but never reach it
      let current = 30;
      intervalRef.current = setInterval(() => {
        current += (85 - current) * 0.08;
        setProgress(current);
        if (current > 84) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 200);
    }, 50);

    // Content is already loaded (since useEffect fires after render), so finish
    const finishTimer = setTimeout(() => {
      cleanup();
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }, 150);

    return () => {
      cleanup();
      clearTimeout(finishTimer);
    };
  }, [pathname, searchParams, cleanup]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[9999] h-[3px]"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="h-full bg-gradient-to-r from-brand-400 via-brand-300 to-brand-400"
        style={{
          width: `${progress}%`,
          transition: progress === 0
            ? 'none'
            : progress === 100
              ? 'width 200ms ease-out, opacity 200ms ease-out'
              : 'width 400ms ease-out',
          opacity: visible ? 1 : 0,
          boxShadow: '0 0 10px rgba(52, 211, 153, 0.5), 0 0 4px rgba(52, 211, 153, 0.3)',
        }}
      />
    </div>
  );
}
