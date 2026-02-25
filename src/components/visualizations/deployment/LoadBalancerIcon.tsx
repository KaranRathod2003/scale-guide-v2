'use client';

import { motion } from 'framer-motion';

interface LoadBalancerIconProps {
  isActive?: boolean;
}

export default function LoadBalancerIcon({ isActive = false }: LoadBalancerIconProps) {
  const color = isActive ? '#34d399' : '#71717a';

  return (
    <div className="relative flex flex-col items-center gap-1.5">
      {/* Active glow */}
      {isActive && (
        <motion.div
          className="absolute -inset-3 rounded-2xl bg-emerald-500/10 blur-xl"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <svg width="44" height="44" viewBox="0 0 44 44" className="relative">
        {/* Shield / hexagon shape */}
        <motion.path
          d="M22 2L40 12V32L22 42L4 32V12L22 2Z"
          fill={`${color}10`}
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Incoming arrow (top) */}
        <path d="M14 18L22 14L30 18" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />

        {/* Split arrows (bottom) */}
        <path d="M16 26L22 22L28 26" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
        <line x1="16" y1="26" x2="16" y2="30" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.4} />
        <line x1="28" y1="26" x2="28" y2="30" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.4} />

        {/* Center dot */}
        <circle cx="22" cy="22" r="2.5" fill={color} opacity={isActive ? 0.8 : 0.4} />
      </svg>

      <span className="text-[9px] font-mono text-zinc-400">LB</span>
    </div>
  );
}
