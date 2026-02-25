'use client';

import { motion } from 'framer-motion';
import type { ConnectionSimState } from '@/types/postgresql';

const PHASES = [
  { id: 'dns-resolve', label: 'DNS', x: 0 },
  { id: 'tcp-connect', label: 'TCP', x: 1 },
  { id: 'ssl-handshake', label: 'SSL', x: 2 },
  { id: 'auth', label: 'Auth', x: 3 },
  { id: 'query-send', label: 'Query', x: 4 },
  { id: 'query-execute', label: 'Execute', x: 5 },
  { id: 'response', label: 'Response', x: 6 },
  { id: 'complete', label: 'Done', x: 7 },
] as const;

function getPhaseIndex(phase: string): number {
  const idx = PHASES.findIndex((p) => p.id === phase);
  return idx >= 0 ? idx : -1;
}

interface ConnectionFlowDiagramProps {
  state: ConnectionSimState;
}

export default function ConnectionFlowDiagram({ state }: ConnectionFlowDiagramProps) {
  const activeIndex = getPhaseIndex(state.phase);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 680 120" className="w-full min-w-[500px]" fill="none">
        {/* App icon */}
        <g transform="translate(10, 35)">
          <rect width="50" height="50" rx="8" className="fill-zinc-700 stroke-zinc-500" strokeWidth="1" />
          <text x="25" y="30" textAnchor="middle" className="fill-zinc-300 text-[9px] font-medium">App</text>
        </g>

        {/* Database icon */}
        <g transform="translate(620, 35)">
          <rect width="50" height="50" rx="8" className="fill-brand-500/10 stroke-brand-400" strokeWidth="1" />
          <text x="25" y="30" textAnchor="middle" className="fill-brand-400 text-[9px] font-medium">PG</text>
        </g>

        {/* Connection line */}
        <line x1="60" y1="60" x2="620" y2="60" className="stroke-zinc-700" strokeWidth="2" strokeDasharray="4 3" />

        {/* Active progress line */}
        {activeIndex >= 0 && (
          <motion.line
            x1="60"
            y1="60"
            x2={60 + ((activeIndex + 1) / PHASES.length) * 560}
            y2="60"
            className="stroke-brand-400"
            strokeWidth="2"
            initial={{ x2: 60 }}
            animate={{ x2: 60 + ((activeIndex + 1) / PHASES.length) * 560 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Phase nodes */}
        {PHASES.map((phase, i) => {
          const cx = 90 + i * 70;
          const isDone = activeIndex > i || state.phase === 'complete';
          const isActive = activeIndex === i && state.phase !== 'complete';
          const isPending = activeIndex < i && state.phase !== 'complete';

          return (
            <g key={phase.id} transform={`translate(${cx}, 60)`}>
              {/* Node circle */}
              <motion.circle
                r={isActive ? 14 : 10}
                className={
                  isDone
                    ? 'fill-brand-500 stroke-brand-400'
                    : isActive
                    ? 'fill-brand-500/30 stroke-brand-400'
                    : 'fill-zinc-800 stroke-zinc-600'
                }
                strokeWidth="1.5"
                animate={isActive ? { r: [12, 14, 12] } : { r: 10 }}
                transition={isActive ? { duration: 0.8, repeat: Infinity } : {}}
              />
              {/* Checkmark for done */}
              {isDone && (
                <path d="M-4 0l3 3 5-6" className="stroke-white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {/* Label */}
              <text
                y={isPending ? 28 : 28}
                textAnchor="middle"
                className={`text-[8px] font-medium ${
                  isDone ? 'fill-brand-400' : isActive ? 'fill-white' : 'fill-zinc-500'
                }`}
              >
                {phase.label}
              </text>
            </g>
          );
        })}

        {/* Packet animation */}
        {activeIndex >= 0 && state.phase !== 'complete' && state.phase !== 'idle' && (
          <motion.circle
            r="4"
            className="fill-brand-400"
            animate={{
              cx: [90 + activeIndex * 70 - 20, 90 + activeIndex * 70 + 20],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{ duration: 0.6, repeat: Infinity }}
            cy="60"
          />
        )}
      </svg>
    </div>
  );
}
