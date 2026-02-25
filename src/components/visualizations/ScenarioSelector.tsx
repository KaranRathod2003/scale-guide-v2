'use client';

import { motion } from 'framer-motion';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  company?: string;
}

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  activeScenario: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
}

export default function ScenarioSelector({ scenarios, activeScenario, onSelect, disabled }: ScenarioSelectorProps) {
  return (
    <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
      {scenarios.map((scenario) => (
        <motion.button
          key={scenario.id}
          whileHover={disabled ? undefined : { y: -2 }}
          onClick={() => !disabled && onSelect(scenario.id)}
          disabled={disabled}
          className={`relative rounded-lg border p-3 text-left transition-colors sm:rounded-xl sm:p-4 ${
            activeScenario === scenario.id
              ? 'border-brand-400 bg-brand-500/10'
              : 'border-zinc-600/40 bg-zinc-700/30 hover:border-zinc-500'
          } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
            <span className="text-brand-400">{scenario.icon}</span>
            <span className="text-xs font-medium text-white sm:text-sm">{scenario.name}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-200 sm:text-xs">{scenario.description}</p>
          {scenario.company && (
            <span className="mt-2 inline-block rounded bg-zinc-600/30 px-2 py-0.5 text-[10px] text-zinc-300">
              {scenario.company}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}
