'use client';

import { useState, useRef, useCallback } from 'react';
import type { ProgrammingLanguage, ConnectionMethod, ConnectionSimState } from '@/types/postgresql';
import { createInitialConnectionState, connectionTick, getTotalConnectionTicks } from './postgresqlLogic';

const BASE_INTERVAL = 300;

export function usePostgresqlSimulation() {
  const [language, setLanguage] = useState<ProgrammingLanguage>('nodejs');
  const [method, setMethod] = useState<ConnectionMethod>('pool');
  const [state, setState] = useState<ConnectionSimState>(() =>
    createInitialConnectionState('nodejs', 'pool')
  );
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const tick = useCallback(() => {
    setState((prev) => {
      const next = connectionTick(prev);
      if (next.tick >= getTotalConnectionTicks()) {
        // Auto-stop when complete
        setTimeout(() => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }, 0);
        return { ...next, phase: 'complete' };
      }
      return next;
    });
  }, []);

  const start = useCallback(() => {
    // Reset first
    setState(createInitialConnectionState(language, method));
    setIsRunning(true);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      tick();
    }, BASE_INTERVAL);
  }, [language, method, tick]);

  const reset = useCallback(() => {
    stop();
    setState(createInitialConnectionState(language, method));
  }, [stop, language, method]);

  const changeLanguage = useCallback((lang: ProgrammingLanguage) => {
    stop();
    setLanguage(lang);
    setState(createInitialConnectionState(lang, method));
  }, [stop, method]);

  const changeMethod = useCallback((m: ConnectionMethod) => {
    stop();
    setMethod(m);
    setState(createInitialConnectionState(language, m));
  }, [stop, language]);

  return {
    state,
    isRunning,
    language,
    method,
    start,
    stop,
    reset,
    changeLanguage,
    changeMethod,
  };
}
