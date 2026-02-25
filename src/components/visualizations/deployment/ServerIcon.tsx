'use client';

import { motion } from 'framer-motion';

interface ServerIconProps {
  version: 'v1' | 'v2';
  status: 'running' | 'deploying' | 'failing' | 'draining' | 'stopped';
  size?: number;
  label?: string;
}

function getStatusColor(version: 'v1' | 'v2', status: string): string {
  if (status === 'failing') return '#ef4444';
  if (status === 'draining' || status === 'stopped') return '#71717a';
  if (status === 'deploying') return '#a1a1aa';
  return version === 'v1' ? '#3b82f6' : '#22c55e';
}

function getGlowColor(version: 'v1' | 'v2', status: string): string {
  if (status === 'failing') return 'rgba(239, 68, 68, 0.3)';
  if (status === 'deploying') return 'rgba(161, 161, 170, 0.15)';
  if (status === 'draining' || status === 'stopped') return 'transparent';
  return version === 'v1' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)';
}

export default function ServerIcon({ version, status, size = 56, label }: ServerIconProps) {
  const color = getStatusColor(version, status);
  const glow = getGlowColor(version, status);
  const opacity = status === 'stopped' ? 0.3 : status === 'draining' ? 0.5 : 1;

  return (
    <motion.div
      style={{ width: size + 8, opacity }}
      className="relative flex flex-col items-center gap-1.5"
    >
      {/* Glow effect */}
      <div
        className="absolute -inset-1 rounded-xl blur-md transition-all duration-500"
        style={{ backgroundColor: glow }}
      />

      <svg width={size} height={size} viewBox="0 0 56 56" className="relative">
        {/* Main server body */}
        <motion.rect
          x="4"
          y="2"
          width="48"
          height="52"
          rx="6"
          fill={`${color}10`}
          stroke={color}
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Server rack lines */}
        <rect x="12" y="10" width="32" height="4" rx="2" fill={color} opacity={0.2} />
        <rect x="12" y="18" width="32" height="4" rx="2" fill={color} opacity={0.2} />
        <rect x="12" y="26" width="32" height="4" rx="2" fill={color} opacity={0.2} />

        {/* Activity indicators (LEDs) */}
        <circle cx="40" cy="12" r="2" fill={color} opacity={status === 'running' ? 0.9 : 0.3} />
        <circle cx="40" cy="20" r="2" fill={color} opacity={status === 'running' ? 0.7 : 0.2} />
        <circle cx="40" cy="28" r="2" fill={color} opacity={status === 'running' ? 0.5 : 0.15} />

        {/* Version badge */}
        <rect x="14" y="36" width="28" height="14" rx="3" fill={`${color}20`} />
        <text x="28" y="46" textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace" fontWeight="bold">
          {version}
        </text>
      </svg>

      {label && (
        <span className="max-w-[64px] truncate text-[9px] font-mono text-zinc-500">{label}</span>
      )}

      {/* Deploying pulse */}
      {status === 'deploying' && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-dashed border-zinc-500"
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Failing pulse */}
      {status === 'failing' && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-red-500/60"
          animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.03, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}
