'use client';

import { useState, Suspense } from 'react';
import Header from './Header';
import Footer from './Footer';
import RouteProgressBar from './RouteProgressBar';
import AssistantPanel from '@/components/assistant/AssistantPanel';
import FloatingAskAIButton from '@/components/assistant/FloatingAskAIButton';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <>
      <Suspense fallback={null}>
        <RouteProgressBar />
      </Suspense>
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
      <FloatingAskAIButton onClick={() => setAssistantOpen(true)} isOpen={assistantOpen} />
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}
