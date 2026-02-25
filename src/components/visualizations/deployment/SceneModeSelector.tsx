'use client';

import { motion } from 'framer-motion';

export interface SceneMode {
  id: 'failure' | 'success';
  name: string;
  description: string;
  company: string;
}

interface SceneModeSelectorProps {
  scenes: SceneMode[];
  activeScene: string | null;
  onSelect: (id: 'failure' | 'success') => void;
  disabled: boolean;
}

export default function SceneModeSelector({ scenes, activeScene, onSelect, disabled }: SceneModeSelectorProps) {
  return (
    <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
      {scenes.map((scene) => {
        const isFailure = scene.id === 'failure';
        const isActive = activeScene === scene.id;
        return (
          <motion.button
            key={scene.id}
            whileHover={disabled ? undefined : { y: -2 }}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            onClick={() => !disabled && onSelect(scene.id)}
            disabled={disabled}
            className={`group relative overflow-hidden rounded-lg border p-3 text-left transition-all duration-300 sm:rounded-xl sm:p-4 ${
              isActive
                ? isFailure
                  ? 'border-red-400/60 bg-red-500/10 shadow-lg shadow-red-500/10'
                  : 'border-green-400/60 bg-green-500/10 shadow-lg shadow-green-500/10'
                : 'border-zinc-600/40 bg-zinc-700/30 hover:border-zinc-500 hover:bg-zinc-700/50'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {/* Subtle gradient overlay when active */}
            {isActive && (
              <div className={`absolute inset-0 opacity-30 ${
                isFailure
                  ? 'bg-gradient-to-br from-red-500/10 to-transparent'
                  : 'bg-gradient-to-br from-green-500/10 to-transparent'
              }`} />
            )}

            <div className="relative">
              <div className="mb-1.5 flex items-center gap-2 sm:mb-2.5 sm:gap-2.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  isFailure ? 'bg-red-500/15' : 'bg-green-500/15'
                }`}>
                  <span className={isFailure ? 'text-red-400' : 'text-green-400'}>
                    {isFailure ? (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="8" cy="8" r="6" />
                        <path d="M6 6l4 4M10 6l-4 4" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="8" cy="8" r="6" />
                        <path d="M5.5 8l2 2 3.5-3.5" />
                      </svg>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-white sm:text-sm">{scene.name}</span>
                  <span className={`text-[10px] font-medium ${
                    isFailure ? 'text-red-400/80' : 'text-green-400/80'
                  }`}>
                    {scene.company}
                  </span>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-200 sm:text-xs">{scene.description}</p>

              {!isActive && !disabled && (
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 transition-colors group-hover:text-zinc-200">
                  Click to simulate
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 2l4 3-4 3" />
                  </svg>
                </span>
              )}

              {isActive && (
                <span className={`mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium ${
                  isFailure ? 'text-red-400' : 'text-green-400'
                }`}>
                  <motion.span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${isFailure ? 'bg-red-400' : 'bg-green-400'}`}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Running simulation
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
