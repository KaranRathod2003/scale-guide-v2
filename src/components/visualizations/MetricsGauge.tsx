'use client';

import { motion } from 'framer-motion';

interface MetricsGaugeProps {
  value: number;
  threshold: number;
  label: string;
}

function getColor(value: number, threshold: number): string {
  if (value < threshold * 0.7) return '#22c55e';
  if (value < threshold) return '#eab308';
  return '#ef4444';
}

export default function MetricsGauge({ value, threshold, label }: MetricsGaugeProps) {
  const color = getColor(value, threshold);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-200">{label}</span>
        <span style={{ color }} className="font-mono font-medium">{Math.round(value)}%</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-600/40">
        <motion.div
          className="h-full rounded-full"
          animate={{
            width: `${Math.min(value, 100)}%`,
            backgroundColor: color,
          }}
          transition={{ duration: 0.5 }}
        />
        {/* Threshold marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white/30"
          style={{ left: `${threshold}%` }}
        />
      </div>
      {value >= threshold && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] font-medium text-red-400"
        >
          Threshold exceeded - scaling triggered
        </motion.span>
      )}
    </div>
  );
}
