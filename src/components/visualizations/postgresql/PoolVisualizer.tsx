'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PoolConnection, PoolState } from '@/types/postgresql';

function createInitialPool(): PoolState {
  return {
    connections: Array.from({ length: 3 }, (_, i) => ({
      id: `conn-${i}`,
      status: 'idle' as const,
      age: 0,
    })),
    maxSize: 10,
    minSize: 2,
    waitQueue: 0,
    totalQueries: 0,
  };
}

let connIdCounter = 10;

export default function PoolVisualizer() {
  const [pool, setPool] = useState<PoolState>(createInitialPool);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setPool((prev) => {
      const conns = prev.connections.map((c) => ({ ...c, age: c.age + 1 }));

      // Randomly activate idle connections
      const idleConns = conns.filter((c) => c.status === 'idle');
      if (idleConns.length > 0 && Math.random() > 0.4) {
        const target = idleConns[Math.floor(Math.random() * idleConns.length)];
        const queries = ['SELECT *', 'INSERT', 'UPDATE', 'JOIN', 'COUNT(*)'];
        target.status = 'active';
        target.queryLabel = queries[Math.floor(Math.random() * queries.length)];
      }

      // Release some active connections
      const activeConns = conns.filter((c) => c.status === 'active');
      activeConns.forEach((c) => {
        if (c.age > 3 && Math.random() > 0.5) {
          c.status = 'idle';
          c.queryLabel = undefined;
          c.age = 0;
        }
      });

      // Drain old connections
      conns.forEach((c) => {
        if (c.age > 15 && c.status === 'idle' && conns.length > prev.minSize) {
          c.status = 'draining';
        }
      });

      // Remove drained
      const alive = conns.filter((c) => c.status !== 'draining' || c.age < 18);

      // Add new connections if needed under load
      let newConns = [...alive];
      const waitQueue = Math.max(0, Math.floor(Math.random() * 3) - 1);
      if (waitQueue > 0 && alive.length < prev.maxSize) {
        newConns.push({
          id: `conn-${++connIdCounter}`,
          status: 'creating',
          age: 0,
        });
      }

      // Transition creating -> idle
      newConns = newConns.map((c) =>
        c.status === 'creating' && c.age > 0
          ? { ...c, status: 'idle' as const }
          : c
      );

      return {
        ...prev,
        connections: newConns,
        waitQueue,
        totalQueries: prev.totalQueries + activeConns.length,
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = () => {
    if (intervalRef.current) return;
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 800);
  };

  const pause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const reset = () => {
    pause();
    connIdCounter = 10;
    setPool(createInitialPool());
  };

  const statusColors: Record<string, string> = {
    idle: 'border-zinc-500 bg-zinc-700',
    active: 'border-brand-400 bg-brand-500/20',
    draining: 'border-amber-500 bg-amber-500/10',
    creating: 'border-sky-400 bg-sky-500/10',
  };

  const statusLabels: Record<string, string> = {
    idle: 'Idle',
    active: 'Active',
    draining: 'Draining',
    creating: 'Creating',
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={isRunning ? pause : start}
          className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-600"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-400"
        >
          Reset
        </button>
        <div className="ml-auto flex gap-4 text-xs text-zinc-400">
          <span>Connections: <strong className="text-white">{pool.connections.length}</strong> / {pool.maxSize}</span>
          <span>Queries: <strong className="text-white">{pool.totalQueries}</strong></span>
          <span>Wait Queue: <strong className={pool.waitQueue > 0 ? 'text-amber-400' : 'text-white'}>{pool.waitQueue}</strong></span>
        </div>
      </div>

      {/* Pool visualization */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Connection Pool</h4>
        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {pool.connections.map((conn) => (
              <motion.div
                key={conn.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={`flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 ${statusColors[conn.status]}`}
              >
                {conn.status === 'active' && (
                  <motion.div
                    className="mb-1 h-2 w-2 rounded-full bg-brand-400"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
                <span className="text-[10px] font-medium text-zinc-300">
                  {statusLabels[conn.status]}
                </span>
                {conn.queryLabel && (
                  <span className="mt-0.5 text-[8px] font-mono text-brand-400">{conn.queryLabel}</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded border ${statusColors[status]}`} />
            <span className="text-zinc-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
