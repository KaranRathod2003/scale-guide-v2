import type { ConnectionPhase, ConnectionSimState, ProgrammingLanguage, ConnectionMethod } from '@/types/postgresql';

export interface ConnectionStep {
  phase: ConnectionPhase;
  label: string;
  duration: number; // ticks
}

const CONNECTION_STEPS: ConnectionStep[] = [
  { phase: 'dns-resolve', label: 'Resolving DNS...', duration: 2 },
  { phase: 'tcp-connect', label: 'Establishing TCP connection on port 5432...', duration: 3 },
  { phase: 'ssl-handshake', label: 'Negotiating SSL/TLS...', duration: 2 },
  { phase: 'auth', label: 'Authenticating (scram-sha-256)...', duration: 2 },
  { phase: 'query-send', label: 'Sending query...', duration: 1 },
  { phase: 'query-execute', label: 'Server parsing & executing query...', duration: 3 },
  { phase: 'response', label: 'Receiving result set...', duration: 2 },
  { phase: 'complete', label: 'Query complete!', duration: 1 },
];

export function getConnectionSteps(): ConnectionStep[] {
  return CONNECTION_STEPS;
}

export function createInitialConnectionState(
  language: ProgrammingLanguage,
  method: ConnectionMethod
): ConnectionSimState {
  return {
    phase: 'idle',
    tick: 0,
    language,
    method,
    logs: CONNECTION_STEPS.map((step) => ({
      step: step.label,
      status: 'pending' as const,
    })),
  };
}

export function connectionTick(state: ConnectionSimState): ConnectionSimState {
  const newTick = state.tick + 1;
  let cumulativeTicks = 0;
  let currentStepIndex = -1;
  let currentPhase: ConnectionPhase = 'complete';

  for (let i = 0; i < CONNECTION_STEPS.length; i++) {
    cumulativeTicks += CONNECTION_STEPS[i].duration;
    if (newTick <= cumulativeTicks) {
      currentStepIndex = i;
      currentPhase = CONNECTION_STEPS[i].phase;
      break;
    }
  }

  const newLogs = CONNECTION_STEPS.map((step, i) => {
    if (i < currentStepIndex) {
      return { step: step.label, status: 'done' as const };
    } else if (i === currentStepIndex) {
      return { step: step.label, status: 'active' as const };
    }
    return { step: step.label, status: 'pending' as const };
  });

  // If we've passed all steps
  if (currentStepIndex === -1) {
    return {
      ...state,
      tick: newTick,
      phase: 'complete',
      logs: CONNECTION_STEPS.map((step) => ({
        step: step.label,
        status: 'done' as const,
      })),
    };
  }

  return {
    ...state,
    tick: newTick,
    phase: currentPhase,
    logs: newLogs,
  };
}

export function getTotalConnectionTicks(): number {
  return CONNECTION_STEPS.reduce((sum, s) => sum + s.duration, 0);
}
