'use client';

import { motion } from 'framer-motion';

interface TrafficGraphProps {
  points: number[];
  maxValue: number;
  label: string;
  color?: string;
}

export default function TrafficGraph({ points, maxValue, label, color = '#34d399' }: TrafficGraphProps) {
  const width = 300;
  const height = 60;
  const padding = 4;

  const getY = (val: number) => height - padding - ((val / maxValue) * (height - padding * 2));
  const getX = (i: number) => padding + (i / Math.max(points.length - 1, 1)) * (width - padding * 2);

  const pathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(p)}`).join(' ')
    : '';

  const areaD = pathD
    ? `${pathD} L${getX(points.length - 1)},${height - padding} L${getX(0)},${height - padding} Z`
    : '';

  return (
    <div className="rounded-lg border border-zinc-600/40 bg-zinc-700/30 p-3">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-zinc-300">{label}</span>
        <span style={{ color }} className="font-mono">
          {points.length > 0 ? `${points[points.length - 1]} req/s` : '0 req/s'}
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            x2={width - padding}
            y1={height - padding - ratio * (height - padding * 2)}
            y2={height - padding - ratio * (height - padding * 2)}
            stroke="#33333d"
            strokeWidth="0.5"
          />
        ))}
        {/* Area fill */}
        {areaD && (
          <motion.path
            d={areaD}
            fill={color}
            fillOpacity={0.1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
        {/* Line */}
        {pathD && (
          <motion.path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
        {/* Latest point dot */}
        {points.length > 0 && (
          <motion.circle
            cx={getX(points.length - 1)}
            cy={getY(points[points.length - 1])}
            r="3"
            fill={color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
      </svg>
    </div>
  );
}
