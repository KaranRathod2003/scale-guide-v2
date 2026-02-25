'use client';

import { motion } from 'framer-motion';

interface EventSourceIconProps {
  isActive?: boolean;
  label?: string;
}

export default function EventSourceIcon({ isActive = false, label = 'Events' }: EventSourceIconProps) {
  const color = isActive ? '#f59e0b' : '#71717a';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        className="relative"
        animate={isActive ? { filter: [`drop-shadow(0 0 3px ${color}40)`, `drop-shadow(0 0 8px ${color}60)`, `drop-shadow(0 0 3px ${color}40)`] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          {/* Queue / message stack */}
          <rect x="4" y="6" width="28" height="6" rx="2" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
          <rect x="4" y="14" width="28" height="6" rx="2" fill={`${color}20`} stroke={color} strokeWidth="1.5" />
          <rect x="4" y="22" width="28" height="6" rx="2" fill={`${color}25`} stroke={color} strokeWidth="1.5" />
          {/* Lightning bolt overlay */}
          <path
            d="M20 4l-6 12h5l-2 10 8-14h-6l1-8z"
            fill={color}
            opacity={0.6}
          />
        </svg>
        {isActive && (
          <motion.div
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>
      <span className="text-[9px] font-medium text-zinc-400">{label}</span>
    </div>
  );
}
