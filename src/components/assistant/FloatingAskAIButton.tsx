'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface FloatingAskAIButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function FloatingAskAIButton({ onClick, isOpen }: FloatingAskAIButtonProps) {
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={onClick}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition-colors hover:bg-brand-600 sm:px-5"
        >
          {/* Sparkle icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <path
              d="M9 1l1.5 4.5L15 7l-4.5 1.5L9 13l-1.5-4.5L3 7l4.5-1.5L9 1z"
              fill="currentColor"
            />
            <path
              d="M14 11l.75 2.25L17 14l-2.25.75L14 17l-.75-2.25L11 14l2.25-.75L14 11z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
          <span className="hidden sm:inline">Ask AI</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
