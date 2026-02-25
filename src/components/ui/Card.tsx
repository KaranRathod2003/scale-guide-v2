'use client';

import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`rounded-xl border border-zinc-600/40 bg-surface-raised p-6 transition-colors ${hover ? 'hover:border-brand-400/50' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
