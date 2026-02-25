'use client';

import { motion } from 'framer-motion';

interface PodIconProps {
  status: 'running' | 'pending' | 'terminating';
  cpu: number;
  size?: number;
}

function getCpuColor(cpu: number): string {
  if (cpu < 50) return '#22c55e';
  if (cpu < 70) return '#eab308';
  return '#ef4444';
}

export default function PodIcon({ status, cpu, size = 48 }: PodIconProps) {
  const color = status === 'running' ? getCpuColor(cpu) : status === 'pending' ? '#a1a1aa' : '#71717a';
  const opacity = status === 'terminating' ? 0.4 : 1;

  return (
    <motion.div
      style={{ width: size, height: size, opacity }}
      className="relative flex items-center justify-center"
    >
      <svg width={size} height={size} viewBox="0 0 48 48">
        {/* Pod hexagon */}
        <motion.path
          d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
          fill={`${color}15`}
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* CPU fill bar inside */}
        <rect
          x="16"
          y={36 - (cpu / 100) * 24}
          width="16"
          height={(cpu / 100) * 24}
          fill={color}
          opacity={0.3}
          rx="2"
        />
        {/* Inner icon */}
        <text x="24" y="26" textAnchor="middle" fill={color} fontSize="10" fontFamily="monospace">
          {status === 'pending' ? '...' : `${cpu}%`}
        </text>
      </svg>
      {status === 'pending' && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-dashed border-zinc-500"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
