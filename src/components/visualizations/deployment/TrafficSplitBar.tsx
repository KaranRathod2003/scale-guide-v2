'use client';

import { motion } from 'framer-motion';

interface TrafficSplitBarProps {
  v1Percent: number;
  v2Percent: number;
  label?: string;
}

export default function TrafficSplitBar({ v1Percent, v2Percent, label = 'Traffic Split' }: TrafficSplitBarProps) {
  return (
    <div className="rounded-lg border border-zinc-600/40 bg-zinc-700/30 p-3 sm:rounded-xl sm:p-4">
      <div className="mb-2 flex flex-col gap-1 text-xs sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-zinc-200">{label}</span>
        <div className="flex gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="font-mono text-[11px] text-blue-400 sm:text-xs">v1: {Math.round(v1Percent)}%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="font-mono text-[11px] text-green-400 sm:text-xs">v2: {Math.round(v2Percent)}%</span>
          </span>
        </div>
      </div>
      <div className="relative flex h-4 w-full overflow-hidden rounded-full bg-zinc-600/40 sm:h-5">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-500"
          style={{ borderRadius: v2Percent > 0 ? '9999px 0 0 9999px' : '9999px' }}
          animate={{ width: `${v1Percent}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
        <motion.div
          className="h-full bg-gradient-to-r from-green-600 to-green-500"
          style={{ borderRadius: v1Percent > 0 ? '0 9999px 9999px 0' : '9999px' }}
          animate={{ width: `${v2Percent}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
        {/* Divider line */}
        {v1Percent > 0 && v2Percent > 0 && (
          <motion.div
            className="absolute top-0 h-full w-px bg-zinc-800"
            animate={{ left: `${v1Percent}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  );
}
