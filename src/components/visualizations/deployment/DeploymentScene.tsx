'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ServerIcon from './ServerIcon';
import UserGroupIcon from './UserGroupIcon';
import LoadBalancerIcon from './LoadBalancerIcon';

interface Server {
  id: string;
  version: 'v1' | 'v2';
  status: 'running' | 'deploying' | 'failing' | 'draining' | 'stopped';
  label: string;
  isShadow?: boolean;
}

interface DeploymentSceneProps {
  servers: Server[];
  v1Traffic: number;
  v2Traffic: number;
  isFlowing: boolean;
  variant?: 'default' | 'shadow' | 'ab-testing';
  v1Label?: string;
  v2Label?: string;
  deploymentName?: string;
}

function TrafficDots({ color, count, duration, opacity = 1, dashed = false }: {
  color: string;
  count: number;
  duration: number;
  opacity?: number;
  dashed?: boolean;
}) {
  if (count === 0) return null;

  return (
    <div className="relative h-1 flex-1">
      {/* Base line */}
      <div
        className="absolute inset-y-0 left-0 right-0 rounded-full"
        style={{
          backgroundColor: `${color}15`,
          ...(dashed ? { backgroundImage: `repeating-linear-gradient(90deg, ${color}20 0, ${color}20 4px, transparent 4px, transparent 8px)`, backgroundColor: 'transparent' } : {}),
        }}
      />
      {/* Animated dots */}
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: color, opacity }}
          initial={{ left: '-4px', opacity: 0 }}
          animate={{
            left: ['0%', '100%'],
            opacity: [0, opacity, opacity, 0],
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

export default function DeploymentScene({
  servers,
  v1Traffic,
  v2Traffic,
  isFlowing,
  variant = 'default',
  v1Label = 'v1',
  v2Label = 'v2',
  deploymentName = 'service',
}: DeploymentSceneProps) {
  const v1Servers = variant === 'shadow'
    ? servers.filter((s) => !s.isShadow)
    : servers.filter((s) => s.version === 'v1');
  const v2Servers = variant === 'shadow'
    ? servers.filter((s) => s.isShadow)
    : servers.filter((s) => s.version === 'v2');

  const hasV1 = v1Servers.length > 0;
  const hasV2 = v2Servers.length > 0;
  const totalRunning = servers.filter((s) => s.status === 'running').length;

  // Dot count is proportional to traffic percentage (1-3 dots)
  const v1Dots = isFlowing && v1Traffic > 0 ? Math.max(1, Math.round(v1Traffic / 35)) : 0;
  const v2Dots = isFlowing && v2Traffic > 0 ? Math.max(1, Math.round(v2Traffic / 35)) : 0;
  const incomingDots = isFlowing ? 3 : 0;

  const isShadow = variant === 'shadow';
  const isAB = variant === 'ab-testing';

  return (
    <div className="rounded-xl border border-zinc-600/40 bg-gradient-to-b from-zinc-700/40 to-zinc-800/30 p-3 sm:p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between border-b border-zinc-600/30 pb-2 sm:mb-4 sm:pb-3">
        <span className="text-[10px] font-mono text-zinc-300 sm:text-xs">
          DEPLOYMENT: {deploymentName}
        </span>
        <span className="text-[9px] font-mono text-zinc-400 sm:text-[10px]">
          {totalRunning} healthy / {servers.length} total
        </span>
      </div>

      {/* Scene layout - stacks vertically on mobile, horizontal on sm+ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Source + flow (Users → LB) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Users */}
          <div className="shrink-0">
            <UserGroupIcon count={isAB ? 4 : 4} isActive={isFlowing} />
          </div>

          {/* Flow: Users → LB */}
          <div className="flex min-w-0 flex-1 items-center sm:min-w-[40px]">
            <TrafficDots
              color="#a1a1aa"
              count={incomingDots}
              duration={2}
            />
            <TrafficArrow color="#71717a" />
          </div>

          {/* Load Balancer */}
          <div className="shrink-0">
            <LoadBalancerIcon isActive={isFlowing} />
          </div>
        </div>

        {/* Flow: LB → Server Groups */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-[2] sm:gap-3">
          {/* v1 path */}
          {(hasV1 || !hasV2) && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TrafficArrow color="#3b82f6" />
              <TrafficDots
                color="#3b82f6"
                count={v1Dots}
                duration={1.8}
              />
              <div className="flex min-w-0 flex-wrap items-center gap-1 sm:gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span className="text-[8px] font-semibold text-blue-400 whitespace-nowrap sm:text-[9px]">{v1Label}</span>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <AnimatePresence mode="popLayout">
                    {v1Servers.map((s, i) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7, y: -6 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        layout
                      >
                        <ServerIcon version={s.version} status={s.status} label={s.label} size={32} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* v2 path */}
          {hasV2 && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TrafficArrow color={isShadow ? '#71717a' : '#22c55e'} />
              <TrafficDots
                color={isShadow ? '#71717a' : '#22c55e'}
                count={isShadow ? (isFlowing ? 2 : 0) : v2Dots}
                duration={1.8}
                opacity={isShadow ? 0.4 : 1}
                dashed={isShadow}
              />
              <div className="flex min-w-0 flex-wrap items-center gap-1 sm:gap-1.5">
                <div className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${isShadow ? 'bg-zinc-600' : 'bg-green-500'}`} />
                  <span className={`text-[8px] font-semibold whitespace-nowrap sm:text-[9px] ${isShadow ? 'text-zinc-400' : 'text-green-400'}`}>{v2Label}</span>
                </div>
                <div className={`flex flex-wrap gap-1 sm:gap-2 ${isShadow ? 'opacity-50' : ''}`}>
                  <AnimatePresence mode="popLayout">
                    {v2Servers.map((s, i) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7, y: -6 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        layout
                      >
                        <ServerIcon version={s.version} status={s.status} label={s.label} size={32} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!hasV1 && !hasV2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-12 items-center justify-center sm:h-14"
            >
              <span className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[10px] text-red-400/80 sm:text-xs">
                No pods running -- service is down
              </span>
            </motion.div>
          )}
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
        {isShadow && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-1 w-4 rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #71717a40 0, #71717a40 3px, transparent 3px, transparent 6px)' }} />
            mirrored
          </span>
        )}
      </div>
    </div>
  );
}
