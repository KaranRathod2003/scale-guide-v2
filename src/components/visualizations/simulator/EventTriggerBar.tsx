'use client';

import { useState, useEffect } from 'react';
import type { EventDef, ScalingEventType } from '@/lib/simulator/types';

interface EventTriggerBarProps {
  events: EventDef[];
  onTrigger: (type: ScalingEventType) => void;
  disabled?: boolean;
}

export default function EventTriggerBar({ events, onTrigger, disabled = false }: EventTriggerBarProps) {
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Clear cooldowns when disabled changes
    if (disabled) setCooldowns({});
  }, [disabled]);

  const handleClick = (type: ScalingEventType) => {
    if (disabled || cooldowns[type]) return;
    onTrigger(type);
    setCooldowns((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCooldowns((prev) => ({ ...prev, [type]: false }));
    }, 1500);
  };

  return (
    <div data-guide-step="events" className="flex flex-wrap gap-1.5 sm:gap-2">
      {events.map((event) => {
        const inCooldown = cooldowns[event.type];
        return (
          <button
            key={event.type}
            onClick={() => handleClick(event.type as ScalingEventType)}
            disabled={disabled || inCooldown}
            title={event.description}
            className={`group flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-medium transition-all sm:px-2.5 sm:text-[11px] ${
              disabled || inCooldown
                ? 'cursor-not-allowed border-zinc-600/30 bg-zinc-700/20 text-zinc-500'
                : 'border-zinc-600/40 bg-zinc-700/30 text-zinc-300 hover:border-zinc-400 hover:bg-zinc-600/40 hover:text-zinc-200 active:scale-95'
            }`}
          >
            <span className="text-sm leading-none">{event.icon}</span>
            <span>{event.label}</span>
          </button>
        );
      })}
    </div>
  );
}
