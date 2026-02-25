import type {
  SimServer, DeploymentSimState,
  BlueGreenConfig, CanaryConfig, RollingConfig, RecreateConfig,
  ABTestingConfig, ShadowConfig,
  DeploymentEventType,
} from './types';
import type { LogEntry } from '@/components/visualizations/NarrationLog';

let logId = 0;
export function resetDeploymentLogId() { logId = 0; }

function makeLog(message: string, type: LogEntry['type'], tick: number): LogEntry {
  return { id: `dep-sim-${++logId}`, timestamp: `t=${tick}`, message, type };
}

// ── Blue-Green Logic ──

export function blueGreenTick(
  state: DeploymentSimState,
  config: BlueGreenConfig,
): { servers: SimServer[]; v1Traffic: number; v2Traffic: number; errorRate: number; phase: DeploymentSimState['phase']; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  let { servers, v1Traffic, v2Traffic, errorRate, phase } = state;
  const deployEvent = state.events.find((e) => e.type === 'deploy_v2');
  const errorEvent = state.events.find((e) => e.type === 'inject_error');
  const rollbackEvent = state.events.find((e) => e.type === 'trigger_rollback');

  if (!deployEvent) return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };

  const ticksSinceDeploy = state.tick - deployEvent.tick;

  // Phase 1: Spin up green environment
  if (ticksSinceDeploy === 1) {
    const greens: SimServer[] = Array.from({ length: config.replicas }, (_, i) => ({
      id: `green-${i}`, version: 'v2', status: 'deploying', label: `green-${i + 1}`,
    }));
    servers = [...servers.filter((s) => s.version === 'v1'), ...greens];
    phase = 'deploying';
    logs.push(makeLog(`Deploying ${config.replicas} green (v2) pods...`, 'action', state.tick));
  }

  // Phase 2: Health checks
  if (ticksSinceDeploy === config.healthCheckDuration + 1) {
    servers = servers.map((s) => s.version === 'v2' ? { ...s, status: 'running' } : s);
    logs.push(makeLog('Green environment healthy. Ready to switch traffic.', 'success', state.tick));
  }

  // Phase 3: Switch traffic
  if (ticksSinceDeploy === config.healthCheckDuration + 3) {
    v1Traffic = 0;
    v2Traffic = 100;
    phase = 'monitoring';
    logs.push(makeLog('Traffic switched: Blue → Green. Monitoring...', 'action', state.tick));
  }

  // Error injection
  if (errorEvent && state.tick - errorEvent.tick === 1 && v2Traffic > 0) {
    errorRate = Math.min(errorRate + 15, 50);
    servers = servers.map((s) => s.version === 'v2' ? { ...s, status: 'failing' } : s);
    logs.push(makeLog(`Errors injected! Error rate: ${errorRate}%`, 'error', state.tick));
  }

  // Auto-rollback check
  if (errorRate > config.rollbackThreshold && !rollbackEvent && v2Traffic > 0 && phase !== 'rolling-back') {
    phase = 'rolling-back';
    logs.push(makeLog(`Error rate ${errorRate}% exceeds threshold ${config.rollbackThreshold}%. Auto-rolling back!`, 'error', state.tick));
    v1Traffic = 100;
    v2Traffic = 0;
    servers = servers.map((s) => s.version === 'v2' ? { ...s, status: 'stopped' } : s);
    errorRate = 0;
  }

  // Manual rollback
  if (rollbackEvent && state.tick - rollbackEvent.tick === 1 && phase !== 'rolling-back') {
    phase = 'rolling-back';
    v1Traffic = 100;
    v2Traffic = 0;
    servers = servers.map((s) => s.version === 'v2' ? { ...s, status: 'stopped' } : s);
    errorRate = 0;
    logs.push(makeLog('Manual rollback: Traffic switched back to Blue (v1).', 'action', state.tick));
  }

  return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };
}

// ── Canary Logic ──

export function canaryTick(
  state: DeploymentSimState,
  config: CanaryConfig,
): { servers: SimServer[]; v1Traffic: number; v2Traffic: number; errorRate: number; phase: DeploymentSimState['phase']; currentStage: number; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  let { servers, v1Traffic, v2Traffic, errorRate, phase } = state;
  let currentStage = state.currentStage ?? -1;
  const deployEvent = state.events.find((e) => e.type === 'deploy_v2');
  const errorEvent = state.events.find((e) => e.type === 'inject_error');
  const rollbackEvent = state.events.find((e) => e.type === 'trigger_rollback');

  if (!deployEvent) return { servers, v1Traffic, v2Traffic, errorRate, phase, currentStage, logs };

  const ticksSinceDeploy = state.tick - deployEvent.tick;

  // Deploy canary on first tick
  if (ticksSinceDeploy === 1) {
    const canary: SimServer = { id: 'canary-0', version: 'v2', status: 'deploying', label: 'canary-1' };
    servers = [...servers.filter((s) => s.version === 'v1'), canary];
    phase = 'deploying';
    logs.push(makeLog('Deploying canary pod...', 'action', state.tick));
  }

  if (ticksSinceDeploy === 3) {
    servers = servers.map((s) => s.version === 'v2' ? { ...s, status: 'running' } : s);
  }

  // Stage progression
  const stageIdx = Math.floor((ticksSinceDeploy - 3) / config.stageDuration);
  if (stageIdx >= 0 && stageIdx < config.stages.length && stageIdx !== currentStage && ticksSinceDeploy >= 3 && phase !== 'rolling-back') {
    currentStage = stageIdx;
    const pct = config.stages[stageIdx];
    v2Traffic = pct;
    v1Traffic = 100 - pct;
    phase = 'monitoring';
    logs.push(makeLog(`Canary stage ${stageIdx + 1}: ${pct}% traffic to v2`, 'action', state.tick));

    if (pct === 100) {
      // Full promotion
      servers = servers.map((s) => ({ ...s, version: 'v2' as const, status: 'running' as const }));
      phase = 'complete';
      logs.push(makeLog('Canary promoted to 100%. Deployment complete!', 'success', state.tick));
    }
  }

  // Error injection
  if (errorEvent && state.tick - errorEvent.tick === 1) {
    errorRate = Math.min(errorRate + 8, 30);
    logs.push(makeLog(`Error injected on v2! Error rate: ${errorRate}%`, 'error', state.tick));
  }

  // Auto-rollback on error threshold
  if (errorRate > config.errorThreshold && phase !== 'rolling-back' && phase !== 'complete') {
    phase = 'rolling-back';
    v1Traffic = 100;
    v2Traffic = 0;
    servers = servers.filter((s) => s.version === 'v1').map((s) => ({ ...s, status: 'running' as const }));
    if (servers.length === 0) {
      servers = Array.from({ length: 4 }, (_, i) => ({ id: `v1-${i}`, version: 'v1' as const, status: 'running' as const, label: `stable-${i + 1}` }));
    }
    errorRate = 0;
    currentStage = -1;
    logs.push(makeLog(`Error rate ${errorRate}% > threshold ${config.errorThreshold}%. Rolling back!`, 'error', state.tick));
  }

  // Manual rollback
  if (rollbackEvent && state.tick - rollbackEvent.tick === 1 && phase !== 'rolling-back') {
    phase = 'rolling-back';
    v1Traffic = 100;
    v2Traffic = 0;
    servers = servers.filter((s) => s.version === 'v1').map((s) => ({ ...s, status: 'running' as const }));
    if (servers.length === 0) {
      servers = Array.from({ length: 4 }, (_, i) => ({ id: `v1-${i}`, version: 'v1' as const, status: 'running' as const, label: `stable-${i + 1}` }));
    }
    errorRate = 0;
    currentStage = -1;
    logs.push(makeLog('Manual rollback initiated. Restoring v1.', 'action', state.tick));
  }

  return { servers, v1Traffic, v2Traffic, errorRate, phase, currentStage, logs };
}

// ── Rolling Update Logic ──

export function rollingTick(
  state: DeploymentSimState,
  config: RollingConfig,
): { servers: SimServer[]; v1Traffic: number; v2Traffic: number; errorRate: number; phase: DeploymentSimState['phase']; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  let { servers, v1Traffic, v2Traffic, errorRate, phase } = state;
  const deployEvent = state.events.find((e) => e.type === 'deploy_v2');
  const errorEvent = state.events.find((e) => e.type === 'inject_error');
  const rollbackEvent = state.events.find((e) => e.type === 'trigger_rollback');

  if (!deployEvent) return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };

  const ticksSinceDeploy = state.tick - deployEvent.tick;
  const step = config.readinessDelay + 1; // ticks per pod replacement

  // Calculate how many should be replaced by now
  const replacedCount = Math.min(config.replicas, Math.floor(ticksSinceDeploy / step));
  const prevReplacedCount = Math.min(config.replicas, Math.floor((ticksSinceDeploy - 1) / step));

  if (rollbackEvent && state.tick - rollbackEvent.tick === 1 && phase !== 'rolling-back') {
    phase = 'rolling-back';
    servers = Array.from({ length: config.replicas }, (_, i) => ({
      id: `rollback-${i}`, version: 'v1', status: 'running', label: `pod-v1-${i + 1}`,
    }));
    v1Traffic = 100;
    v2Traffic = 0;
    errorRate = 0;
    logs.push(makeLog('Rollback: Reverting all pods to v1.', 'action', state.tick));
    return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };
  }

  if (phase === 'rolling-back') return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };

  if (replacedCount > prevReplacedCount && replacedCount <= config.replicas) {
    // Replace the next pod
    const newServers: SimServer[] = [];
    let v2Count = 0;
    let v1Count = 0;
    for (let i = 0; i < config.replicas; i++) {
      if (i < replacedCount) {
        newServers.push({ id: `v2-${i}`, version: 'v2', status: 'running', label: `pod-v2-${i + 1}` });
        v2Count++;
      } else {
        newServers.push({ id: `v1-${i}`, version: 'v1', status: i === replacedCount ? 'draining' : 'running', label: `pod-v1-${i + 1}` });
        v1Count++;
      }
    }

    // Add surge pod
    if (config.maxSurge > 0 && replacedCount < config.replicas) {
      newServers.push({ id: `surge-${replacedCount}`, version: 'v2', status: 'deploying', label: `surge-${replacedCount + 1}` });
    }

    servers = newServers;
    phase = 'deploying';
    const totalRunning = v1Count + v2Count;
    v2Traffic = totalRunning > 0 ? Math.round((v2Count / totalRunning) * 100) : 0;
    v1Traffic = 100 - v2Traffic;
    logs.push(makeLog(`Rolling: ${v2Count}/${config.replicas} pods on v2`, 'action', state.tick));

    if (replacedCount === config.replicas) {
      phase = 'complete';
      v1Traffic = 0;
      v2Traffic = 100;
      logs.push(makeLog('Rolling update complete! All pods on v2.', 'success', state.tick));
    }
  }

  // Error injection
  if (errorEvent && state.tick - errorEvent.tick === 1) {
    errorRate = Math.min(errorRate + 12, 40);
    servers = servers.map((s) => s.version === 'v2' ? { ...s, status: 'failing' } : s);
    logs.push(makeLog(`Errors on v2 pods! Error rate: ${errorRate}%`, 'error', state.tick));
  }

  return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };
}

// ── Recreate Logic ──

export function recreateTick(
  state: DeploymentSimState,
  config: RecreateConfig,
): { servers: SimServer[]; v1Traffic: number; v2Traffic: number; errorRate: number; phase: DeploymentSimState['phase']; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  let { servers, v1Traffic, v2Traffic, errorRate, phase } = state;
  const deployEvent = state.events.find((e) => e.type === 'deploy_v2');
  const errorEvent = state.events.find((e) => e.type === 'inject_error');

  if (!deployEvent) return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };

  const ticksSinceDeploy = state.tick - deployEvent.tick;

  // Phase 1: Shutdown grace period
  if (ticksSinceDeploy === 1) {
    servers = servers.map((s) => ({ ...s, status: 'draining' as const }));
    phase = 'deploying';
    logs.push(makeLog('Terminating all v1 pods...', 'action', state.tick));
  }

  if (ticksSinceDeploy === config.shutdownGrace + 1) {
    servers = [];
    v1Traffic = 0;
    v2Traffic = 0;
    errorRate = 100; // service down
    logs.push(makeLog('All v1 pods terminated. SERVICE DOWN. Starting v2...', 'warning', state.tick));
  }

  // Phase 2: Start v2 pods
  if (ticksSinceDeploy === config.shutdownGrace + 2) {
    servers = Array.from({ length: config.replicas }, (_, i) => ({
      id: `v2-${i}`, version: 'v2', status: 'deploying', label: `v2-pod-${i + 1}`,
    }));
    logs.push(makeLog(`Starting ${config.replicas} v2 pods...`, 'action', state.tick));
  }

  // Phase 3: v2 pods ready
  if (ticksSinceDeploy === config.shutdownGrace + config.startupTime + 2) {
    const hasError = errorEvent && state.tick > errorEvent.tick;
    if (hasError) {
      servers = servers.map((s) => ({ ...s, status: 'failing' as const }));
      errorRate = 100;
      logs.push(makeLog('v2 pods failing! CrashLoopBackOff!', 'error', state.tick));
    } else {
      servers = servers.map((s) => ({ ...s, status: 'running' as const }));
      v2Traffic = 100;
      errorRate = 0;
      phase = 'complete';
      logs.push(makeLog('v2 pods healthy. Service restored!', 'success', state.tick));
    }
  }

  return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };
}

// ── A/B Testing Logic ──

export function abTestingTick(
  state: DeploymentSimState,
  config: ABTestingConfig,
): { servers: SimServer[]; v1Traffic: number; v2Traffic: number; errorRate: number; phase: DeploymentSimState['phase']; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  let { servers, v1Traffic, v2Traffic, errorRate, phase } = state;
  const deployEvent = state.events.find((e) => e.type === 'deploy_v2');
  const errorEvent = state.events.find((e) => e.type === 'inject_error');
  const rollbackEvent = state.events.find((e) => e.type === 'trigger_rollback');

  if (!deployEvent) return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };

  const ticksSinceDeploy = state.tick - deployEvent.tick;

  if (ticksSinceDeploy === 1) {
    const half = Math.floor(config.replicas / 2);
    const aCount = Math.max(1, half);
    const bCount = Math.max(1, config.replicas - aCount);
    servers = [
      ...Array.from({ length: aCount }, (_, i) => ({
        id: `a-${i}`, version: 'v1' as const, status: 'running' as const, label: `variant-a-${i + 1}`,
      })),
      ...Array.from({ length: bCount }, (_, i) => ({
        id: `b-${i}`, version: 'v2' as const, status: 'running' as const, label: `variant-b-${i + 1}`,
      })),
    ];
    v1Traffic = config.v1Percent;
    v2Traffic = config.v2Percent;
    phase = 'monitoring';
    logs.push(makeLog(`A/B test started. A: ${config.v1Percent}% / B: ${config.v2Percent}%`, 'action', state.tick));
  }

  // Error injection
  if (errorEvent && state.tick - errorEvent.tick === 1) {
    errorRate = Math.min(errorRate + 5, 20);
    logs.push(makeLog(`Variant B showing errors: ${errorRate}%`, 'error', state.tick));
  }

  // Rollback: promote A
  if (rollbackEvent && state.tick - rollbackEvent.tick === 1 && phase !== 'rolling-back') {
    phase = 'rolling-back';
    v1Traffic = 100;
    v2Traffic = 0;
    servers = servers.filter((s) => s.version === 'v1').map((s) => ({ ...s, status: 'running' as const }));
    if (servers.length === 0) {
      servers = Array.from({ length: config.replicas }, (_, i) => ({
        id: `a-${i}`, version: 'v1' as const, status: 'running' as const, label: `variant-a-${i + 1}`,
      }));
    }
    errorRate = 0;
    logs.push(makeLog('A/B test ended. Promoting Variant A (v1).', 'action', state.tick));
  }

  return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };
}

// ── Shadow Logic ──

export function shadowTick(
  state: DeploymentSimState,
  config: ShadowConfig,
): { servers: SimServer[]; v1Traffic: number; v2Traffic: number; errorRate: number; phase: DeploymentSimState['phase']; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  let { servers, v1Traffic, v2Traffic, errorRate, phase } = state;
  const deployEvent = state.events.find((e) => e.type === 'deploy_v2');
  const errorEvent = state.events.find((e) => e.type === 'inject_error');
  const rollbackEvent = state.events.find((e) => e.type === 'trigger_rollback');

  if (!deployEvent) return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };

  const ticksSinceDeploy = state.tick - deployEvent.tick;

  if (ticksSinceDeploy === 1) {
    const shadows: SimServer[] = Array.from({ length: config.replicas }, (_, i) => ({
      id: `shadow-${i}`, version: 'v2', status: 'deploying', label: `shadow-${i + 1}`, isShadow: true,
    }));
    servers = [...servers.filter((s) => !s.isShadow), ...shadows];
    phase = 'deploying';
    logs.push(makeLog(`Deploying ${config.replicas} shadow pods. Mirroring ${config.mirrorPercent}% traffic...`, 'action', state.tick));
  }

  if (ticksSinceDeploy === 3) {
    servers = servers.map((s) => s.isShadow ? { ...s, status: 'running' } : s);
    v1Traffic = 100;
    v2Traffic = config.mirrorPercent;
    phase = 'monitoring';
    logs.push(makeLog('Shadow pods running. Mirrored traffic flowing. Responses discarded.', 'success', state.tick));
  }

  // Periodic comparison logs
  if (ticksSinceDeploy > 5 && ticksSinceDeploy % 8 === 0 && phase === 'monitoring' && !errorEvent) {
    const match = 85 + Math.floor(Math.random() * 10);
    logs.push(makeLog(`Shadow comparison: ${match}% responses match production.`, 'info', state.tick));
  }

  // Error: shadow contaminates
  if (errorEvent && state.tick - errorEvent.tick === 1) {
    errorRate = 5;
    logs.push(makeLog('Shadow writing to shared cache! Production data contaminated!', 'error', state.tick));
    servers = servers.map((s) => !s.isShadow ? { ...s, status: 'failing' } : s);
  }

  // Remove shadow
  if (rollbackEvent && state.tick - rollbackEvent.tick === 1) {
    servers = servers.filter((s) => !s.isShadow).map((s) => ({ ...s, status: 'running' as const }));
    v2Traffic = 0;
    errorRate = 0;
    phase = 'rolling-back';
    logs.push(makeLog('Shadow pods removed. Production restored.', 'action', state.tick));
  }

  return { servers, v1Traffic, v2Traffic, errorRate, phase, logs };
}
