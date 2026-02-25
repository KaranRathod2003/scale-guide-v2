'use client';

import { motion } from 'framer-motion';

interface PacketAnimationProps {
  active: boolean;
  direction?: 'right' | 'left';
  color?: string;
}

export default function PacketAnimation({ active, direction = 'right', color = '#34d399' }: PacketAnimationProps) {
  if (!active) return null;

  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2"
      initial={{ x: direction === 'right' ? 0 : '100%', opacity: 0 }}
      animate={{
        x: direction === 'right' ? '100%' : 0,
        opacity: [0, 1, 1, 0],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
    >
      <svg width="12" height="8" viewBox="0 0 12 8">
        <rect width="12" height="8" rx="2" fill={color} opacity="0.8" />
      </svg>
    </motion.div>
  );
}
