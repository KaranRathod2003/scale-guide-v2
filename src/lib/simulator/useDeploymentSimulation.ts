'use client';

import { useState, useRef, useCallback } from 'react';
import type {
  SimSpeed, SimServer, DeploymentSimState,
  BlueGreenConfig, CanaryConfig, RollingConfig, RecreateConfig,
  ABTestingConfig, ShadowConfig,
  DeploymentEventType, DeploymentConfig, SimEvent, LiveMetrics,
} from './types';
import type { LogEntry } from '@/components/visualizations/NarrationLog';
import {
  blueGreenTick, canaryTick, rollingTick, recreateTick,
  abTestingTick, shadowTick, resetDeploymentLogId,
} from './deploymentLogic';
import { calculateDeploymentMetrics } from './metricsEngine';

const BASE_INTERVAL = 400;

let logId = 0;
function makeLog(message: string, type: LogEntry['type'], tick: number): LogEntry {
  return { id: `dep-hook-${++logId}`, timestamp: `t=${tick}`, message, type };
}

type DeploySimType = 'blue-green' | 'canary' | 'rolling' | 'recreate' | 'ab-testing' | 'shadow';

function createInitialServers(simType: DeploySimType, config: DeploymentConfig): SimServer[] {
  const count = 'replicas' in config ? (config as { replicas: number }).replicas : 3;
  if (simType === 'ab-testing') {
    const half = Math.floor(count / 2);
    return [
      ...Array.from({ length: Math.max(1, half) }, (_, i) => ({
        id: `init-a-${i}`, version: 'v1' as const, status: 'running' as const, label: `server-a-${i + 1}`,
      })),
      ...Array.from({ length: Math.max(1, count - half) }, (_, i) => ({
        id: `init-b-${i}`, version: 'v2' as const, status: 'running' as const, label: `server-b-${i + 1}`,
      })),
    ];
  }
  return Array.from({ length: count }, (_, i) => ({
    id: `init-${i}`, version: 'v1' as const, status: 'running' as const, label: `server-${i + 1}`,
  }));
}

function emptyMetrics(serverCount: number): LiveMetrics {
  return {
    podCount: serverCount,
    maxPods: serverCount,
    cpuPercent: 25,
    costPerHour: serverCount * 0.05,
    availability: 100,
    latencyMs: 12,
    traffic: 100,
  };
}

export function useDeploymentSimulation(simType: DeploySimType, config: DeploymentConfig) {
  const [state, setState] = useState<DeploymentSimState>(() => {
    const servers = createInitialServers(simType, config);
    const initTraffic = simType === 'ab-testing'
      ? { v1: (config as ABTestingConfig).v1Percent, v2: (config as ABTestingConfig).v2Percent }
      : { v1: 100, v2: 0 };
    return {
      tick: 0,
      servers,
      v1Traffic: initTraffic.v1,
      v2Traffic: initTraffic.v2,
      errorRate: 0,
      metrics: emptyMetrics(servers.length),
      logs: [],
      events: [],
      phase: 'idle',
      currentStage: -1,
    };
  });

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState<SimSpeed>(1);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const configRef = useRef(config);
  const speedRef = useRef(speed);
  const healthyTicksRef = useRef(0);

  configRef.current = config;
  speedRef.current = speed;

  const tick = useCallback(() => {
    setState((prev) => {
      const cfg = configRef.current;
      const newTick = prev.tick + 1;
      const stateForTick = { ...prev, tick: newTick };

      let result: {
        servers: SimServer[];
        v1Traffic: number;
        v2Traffic: number;
        errorRate: number;
        phase: DeploymentSimState['phase'];
        logs: LogEntry[];
        currentStage?: number;
      };

      switch (simType) {
        case 'blue-green':
          result = blueGreenTick(stateForTick, cfg as BlueGreenConfig);
          break;
        case 'canary':
          result = canaryTick(stateForTick, cfg as CanaryConfig);
          break;
        case 'rolling':
          result = rollingTick(stateForTick, cfg as RollingConfig);
          break;
        case 'recreate':
          result = recreateTick(stateForTick, cfg as RecreateConfig);
          break;
        case 'ab-testing':
          result = abTestingTick(stateForTick, cfg as ABTestingConfig);
          break;
        case 'shadow':
          result = shadowTick(stateForTick, cfg as ShadowConfig);
          break;
        default:
          result = { servers: prev.servers, v1Traffic: prev.v1Traffic, v2Traffic: prev.v2Traffic, errorRate: prev.errorRate, phase: prev.phase, logs: [] };
      }

      const isHealthy = result.errorRate < 5 && result.servers.filter((s) => s.status === 'running').length > 0;
      if (isHealthy) healthyTicksRef.current++;

      const metrics = calculateDeploymentMetrics(
        result.servers,
        result.v1Traffic,
        result.v2Traffic,
        result.errorRate,
        healthyTicksRef.current,
        newTick
      );

      return {
        ...prev,
        tick: newTick,
        servers: result.servers,
        v1Traffic: result.v1Traffic,
        v2Traffic: result.v2Traffic,
        errorRate: result.errorRate,
        phase: result.phase,
        currentStage: result.currentStage ?? prev.currentStage,
        metrics,
        logs: [...prev.logs, ...result.logs].slice(-50),
      };
    });
  }, [simType]);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      tick();
    }, BASE_INTERVAL / speedRef.current);
  }, [tick]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    pause();
    logId = 0;
    resetDeploymentLogId();
    healthyTicksRef.current = 0;
    const cfg = configRef.current;
    const servers = createInitialServers(simType, cfg);
    const initTraffic = simType === 'ab-testing'
      ? { v1: (cfg as ABTestingConfig).v1Percent, v2: (cfg as ABTestingConfig).v2Percent }
      : { v1: 100, v2: 0 };
    setState({
      tick: 0,
      servers,
      v1Traffic: initTraffic.v1,
      v2Traffic: initTraffic.v2,
      errorRate: 0,
      metrics: emptyMetrics(servers.length),
      logs: [],
      events: [],
      phase: 'idle',
      currentStage: -1,
    });
  }, [pause, simType]);

  const changeSpeed = useCallback((newSpeed: SimSpeed) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        tick();
      }, BASE_INTERVAL / newSpeed);
    }
  }, [tick]);

  const triggerEvent = useCallback((type: DeploymentEventType) => {
    setState((prev) => {
      const event: SimEvent = { type, tick: prev.tick };
      const log = makeLog(
        type === 'deploy_v2' ? 'Deploying v2...'
          : type === 'inject_error' ? 'Injecting errors into v2...'
          : 'Triggering rollback...',
        type === 'inject_error' ? 'error' : 'warning',
        prev.tick
      );
      return {
        ...prev,
        events: [...prev.events, event],
        logs: [...prev.logs, log].slice(-50),
      };
    });
  }, []);

  return {
    state,
    isRunning,
    speed,
    start,
    pause,
    reset,
    changeSpeed,
    triggerEvent,
  };
}
