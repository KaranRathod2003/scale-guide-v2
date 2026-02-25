'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAssistant, type AssistantTopic } from '@/hooks/useAssistant';
import ChatMessage from './ChatMessage';
import SuggestionChips from './SuggestionChips';
import RecommendationCard from './RecommendationCard';

export default function ChatInterface({ onNavigate }: { onNavigate?: () => void }) {
  const { messages, sendMessage, isLoading, currentSuggestions, recommendation, topic, switchTopic } = useAssistant();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Topic selector */}
      <div className="flex gap-1 border-b border-zinc-700 px-4 py-2">
        {([
          { id: 'scaling' as AssistantTopic, label: 'Autoscaling' },
          { id: 'deployment' as AssistantTopic, label: 'Deployment' },
          { id: 'postgresql' as AssistantTopic, label: 'PostgreSQL' },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => switchTopic(t.id)}
            className={`relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              topic === t.id ? 'bg-brand-500/10 text-brand-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {recommendation && <RecommendationCard recommendation={recommendation} topic={topic} onNavigate={onNavigate} />}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-1 px-3 py-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-brand-400"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {currentSuggestions.length > 0 && !recommendation && (
        <SuggestionChips suggestions={currentSuggestions} onSelect={sendMessage} />
      )}

      {/* Input */}
      <div className="border-t border-zinc-700 px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={topic === 'scaling' ? 'Describe your workload...' : topic === 'deployment' ? 'Describe your service...' : 'Describe your experience...'}
            className="flex-1 rounded-lg border border-zinc-600 bg-surface-raised px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-brand-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 2L7 9M14 2l-5 12-2-5-5-2 12-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
