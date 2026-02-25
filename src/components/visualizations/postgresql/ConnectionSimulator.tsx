'use client';

import { motion } from 'framer-motion';
import { usePostgresqlSimulation } from '@/lib/simulator/usePostgresqlSimulation';
import LanguageSelector from './LanguageSelector';
import ConnectionFlowDiagram from './ConnectionFlowDiagram';
import type { ConnectionMethod } from '@/types/postgresql';
import { connectionDrivers } from '@/lib/postgresql-data';

const methodOptions: { id: ConnectionMethod; label: string }[] = [
  { id: 'raw-driver', label: 'Raw Driver' },
  { id: 'pool', label: 'Pool' },
  { id: 'orm', label: 'ORM' },
];

export default function ConnectionSimulator() {
  const { state, isRunning, language, method, start, reset, changeLanguage, changeMethod } = usePostgresqlSimulation();

  const driver = connectionDrivers.find((d) => d.language === language);
  const currentMethod = driver?.methods.find((m) => m.id === method);

  // Filter available methods for this language
  const availableMethods = methodOptions.filter(
    (m) => driver?.methods.some((dm) => dm.id === m.id)
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Language</label>
          <LanguageSelector selected={language} onChange={changeLanguage} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Method</label>
          <div className="flex gap-1 rounded-lg bg-zinc-800 p-1">
            {availableMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => changeMethod(m.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  method === m.id
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={start}
            disabled={isRunning}
            className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {state.phase === 'complete' ? 'Replay' : 'Connect'}
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-400"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Driver info */}
      {currentMethod && (
        <div className="rounded-lg border border-zinc-700 bg-surface-raised p-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-400">{currentMethod.library}</span>
            <span className="text-sm text-zinc-300">{currentMethod.description}</span>
          </div>
        </div>
      )}

      {/* Flow diagram */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
        <ConnectionFlowDiagram state={state} />
      </div>

      {/* Narration log */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Connection Log</h4>
        <div className="space-y-1.5">
          {state.logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              {/* Status indicator */}
              <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                {log.status === 'done' && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" className="fill-brand-500/20 stroke-brand-400" strokeWidth="1" />
                    <path d="M4 7l2 2 4-4" className="stroke-brand-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {log.status === 'active' && (
                  <motion.div
                    className="h-3 w-3 rounded-full bg-brand-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
                {log.status === 'pending' && (
                  <div className="h-2 w-2 rounded-full bg-zinc-600" />
                )}
                {log.status === 'error' && (
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                )}
              </div>
              <span className={`text-xs ${
                log.status === 'done' ? 'text-zinc-300' :
                log.status === 'active' ? 'text-white font-medium' :
                'text-zinc-500'
              }`}>
                {log.step}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
