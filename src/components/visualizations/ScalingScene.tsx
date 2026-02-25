'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import UserGroupIcon from './deployment/UserGroupIcon';
import LoadBalancerIcon from './deployment/LoadBalancerIcon';
import EventSourceIcon from './EventSourceIcon';

interface ScalingSceneProps {
  children: ReactNode;
  isFlowing: boolean;
  trafficIntensity?: number;
  variant?: 'default' | 'event-driven';
  deploymentName?: string;
  podCount?: number;
  totalCount?: number;
  sourceName?: string;
  routerName?: string;
}

function TrafficDots({ color, count, duration }: {
  color: string;
  count: number;
  duration: number;
}) {
  if (count === 0) return null;

  return (
    <div className="relative h-1 flex-1 min-w-[30px]">
      <div
        className="absolute inset-y-0 left-0 right-0 rounded-full"
        style={{ backgroundColor: `${color}15` }}
      />
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ left: '-4px', opacity: 0 }}
          animate={{
            left: ['0%', '100%'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration,
            delay: i * (duration / count),
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

function TrafficArrow({ color }: { color: string }) {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" className="shrink-0 mx-0.5">
      <path d="M1 1l5 5-5 5" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
    </svg>
  );
}

export default function ScalingScene({
  children,
  isFlowing,
  trafficIntensity = 3,
  variant = 'default',
  deploymentName = 'service',
  podCount,
  totalCount,
  sourceName,
  routerName,
}: ScalingSceneProps) {
  const isEventDriven = variant === 'event-driven';
  const dotCount = isFlowing ? Math.min(trafficIntensity, 5) : 0;
  const dotColor = isEventDriven ? '#f59e0b' : '#a1a1aa';
  const arrowColor = isEventDriven ? '#f59e0b' : '#71717a';

  return (
    <div className="rounded-xl border border-zinc-600/40 bg-gradient-to-b from-zinc-700/40 to-zinc-800/30 p-3 sm:p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between border-b border-zinc-600/30 pb-2 sm:mb-4 sm:pb-3">
        <span className="text-[10px] font-mono text-zinc-300 sm:text-xs">
          {isEventDriven ? 'EVENT-DRIVEN' : 'SCALING'}: {deploymentName}
        </span>
        {podCount !== undefined && totalCount !== undefined && (
          <span className="text-[9px] font-mono text-zinc-400 sm:text-[10px]">
            {podCount} running / {totalCount} total
          </span>
        )}
      </div>

      {/* Scene layout - stacks on mobile */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Source + flow (Source → Router) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Source */}
          <div className="shrink-0">
            {isEventDriven ? (
              <EventSourceIcon isActive={isFlowing} label={sourceName || 'Events'} />
            ) : (
              <UserGroupIcon count={4} isActive={isFlowing} />
            )}
          </div>

          {/* Flow: Source → Router */}
          <div className="flex min-w-0 flex-1 items-center sm:min-w-[30px] sm:pt-2">
            <TrafficDots color={dotColor} count={dotCount} duration={2} />
            <TrafficArrow color={arrowColor} />
          </div>

          {/* Router / LB */}
          <div className="shrink-0">
            {isEventDriven ? (
              <div className="flex flex-col items-center gap-1">
                <LoadBalancerIcon isActive={isFlowing} />
                <span className="text-[8px] font-medium text-zinc-400 sm:text-[9px]">{routerName || 'Queue'}</span>
              </div>
            ) : (
              <LoadBalancerIcon isActive={isFlowing} />
            )}
          </div>
        </div>

        {/* Flow: Router → Pods + Pod content */}
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:flex-[2] sm:gap-3">
          <div className="flex min-w-[20px] flex-1 items-center pt-3 sm:min-w-[30px] sm:pt-4">
            <TrafficArrow color={isEventDriven ? '#f59e0b' : '#22c55e'} />
            <TrafficDots
              color={isEventDriven ? '#f59e0b' : '#22c55e'}
              count={dotCount}
              duration={1.8}
            />
          </div>

          {/* Pod content (children) */}
          <div className="min-w-0 flex-[2]">
            {children}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-zinc-600/30 pt-2 text-[8px] text-zinc-400 sm:mt-4 sm:gap-4 sm:pt-3 sm:text-[9px]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-1 w-4 rounded-full bg-zinc-500/30" />
          traffic flow
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-zinc-500/40" />
          request
        </span>
        {isEventDriven && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500/40" />
            event trigger
          </span>
        )}
      </div>
    </div>
  );
}
