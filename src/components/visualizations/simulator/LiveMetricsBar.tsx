'use client';

import { motion } from 'framer-motion';
import type { LiveMetrics } from '@/lib/simulator/types';

interface LiveMetricsBarProps {
  metrics: LiveMetrics;
}

function colorForValue(value: number, thresholds: [number, number]): string {
  if (value <= thresholds[0]) return 'text-green-400';
  if (value <= thresholds[1]) return 'text-amber-400';
  return 'text-red-400';
}

function bgForValue(value: number, thresholds: [number, number]): string {
  if (value <= thresholds[0]) return 'bg-green-500/10 border-green-500/20';
  if (value <= thresholds[1]) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

interface MetricCardProps {
  label: string;
  value: string;
  colorClass: string;
  bgClass: string;
}

function MetricCard({ label, value, colorClass, bgClass }: MetricCardProps) {
  return (
    <div className={`rounded-lg border px-2.5 py-1.5 sm:px-3 sm:py-2 ${bgClass}`}>
      <div className="text-[9px] text-zinc-400 sm:text-[10px]">{label}</div>
      <motion.div
        className={`font-mono text-sm font-semibold sm:text-base ${colorClass}`}
        key={value}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
      >
        {value}
      </motion.div>
    </div>
  );
}

export default function LiveMetricsBar({ metrics }: LiveMetricsBarProps) {
  const cpuColor = colorForValue(metrics.cpuPercent, [60, 80]);
  const cpuBg = bgForValue(metrics.cpuPercent, [60, 80]);

  const availColor = metrics.availability >= 99 ? 'text-green-400' : metrics.availability >= 95 ? 'text-amber-400' : 'text-red-400';
  const availBg = metrics.availability >= 99 ? 'bg-green-500/10 border-green-500/20' : metrics.availability >= 95 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  const latColor = colorForValue(metrics.latencyMs, [50, 200]);
  const latBg = bgForValue(metrics.latencyMs, [50, 200]);

  return (
    <div data-guide-step="metrics" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      <MetricCard
        label="Pods"
        value={`${metrics.podCount}/${metrics.maxPods}`}
        colorClass="text-brand-300"
        bgClass="bg-brand-500/10 border-brand-500/20"
      />
      <MetricCard label="CPU" value={`${Math.round(metrics.cpuPercent)}%`} colorClass={cpuColor} bgClass={cpuBg} />
      <MetricCard label="Cost/hr" value={`$${metrics.costPerHour.toFixed(2)}`} colorClass="text-zinc-200" bgClass="bg-zinc-600/20 border-zinc-600/30" />
      <MetricCard label="Avail" value={`${metrics.availability.toFixed(1)}%`} colorClass={availColor} bgClass={availBg} />
    </div>
  );
}
