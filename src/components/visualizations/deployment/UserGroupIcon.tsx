'use client';

import { motion } from 'framer-motion';

interface UserGroupIconProps {
  count?: number;
  isActive?: boolean;
}

function UserSilhouette({ x, delay }: { x: number; delay: number }) {
  return (
    <motion.g
      transform={`translate(${x}, 0)`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Head */}
      <circle cx="10" cy="8" r="5" fill="#a1a1aa" opacity={0.7} />
      {/* Body */}
      <path
        d="M3 24C3 19 6 16 10 16C14 16 17 19 17 24"
        fill="#a1a1aa"
        opacity={0.5}
      />
    </motion.g>
  );
}

export default function UserGroupIcon({ count = 4, isActive = false }: UserGroupIconProps) {
  const users = Array.from({ length: count }, (_, i) => i);
  const width = count * 18 + 4;

  return (
    <div className="relative flex flex-col items-center gap-1.5">
      {/* Active glow */}
      {isActive && (
        <motion.div
          className="absolute -inset-2 rounded-xl bg-zinc-400/10 blur-lg"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <svg width={width} height="28" viewBox={`0 0 ${width} 28`} className="relative">
        {users.map((i) => (
          <UserSilhouette key={i} x={i * 18} delay={i * 0.08} />
        ))}
      </svg>

      <span className="text-[9px] font-mono text-zinc-400">
        {isActive ? 'Users' : 'No traffic'}
      </span>
    </div>
  );
}
