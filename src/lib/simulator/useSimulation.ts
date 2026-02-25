'use client';

import { useState, useRef, useCallback } from 'react';
import type {
  SimSpeed, SimPod, ScalingSimState, HPAConfig, VPAConfig, ClusterConfig, KEDAConfig,
  ScalingEventType, SimEvent, LiveMetrics,
} from './types';
import type { LogEntry } from '@/components/visualizations/NarrationLog';
import { hpaTick, applyTrafficEvent, kedaDesiredReplicas } from './scalingLogic';
import { calculateScalingMetrics } from './metricsEngine';

const BASE_INTERVAL = 400; // ms per tick at 1x
const BASE_TRAFFIC = 50;

let logId = 0;
function makeLog(message: string, type: LogEntry['type'], tick: number): LogEntry {
  return { id: `sim-${++logId}`, timestamp: `t=${tick}`, message, type };
}

function createInitialPods(count: number): SimPod[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `init-pod-${i}`,
    status: 'running' as const,
    cpu: 25 + Math.random() * 10,
    memory: 200 + Math.random() * 100,
    label: `pod-${Math.random().toString(36).slice(2, 7)}`,
  }));
}

type SimType = 'hpa' | 'vpa' | 'cluster' | 'keda';

function emptyMetrics(maxPods: number, podCount: number): LiveMetrics {
  return {
    podCount,
    maxPods,
    cpuPercent: 25,
    costPerHour: podCount * 0.05,
    availability: 100,
    latencyMs: 12,
    traffic: BASE_TRAFFIC,
    queueDepth: 0,
  };
}

export function useSimulation(simType: SimType, config: HPAConfig | VPAConfig | ClusterConfig | KEDAConfig) {
  const [state, setState] = useState<ScalingSimState>(() => {
    const initialPods = simType === 'hpa' ? (config as HPAConfig).initialPods
      : simType === 'keda' ? (config as KEDAConfig).minPods
      : simType === 'cluster' ? (config as ClusterConfig).podsPerNode
      : 2;
    const maxPods = simType === 'hpa' ? (config as HPAConfig).maxPods
      : simType === 'keda' ? (config as KEDAConfig).maxPods
      : 10;
    const pods = createInitialPods(Math.max(1, initialPods));
    return {
      tick: 0,
      pods,
      nodes: [],
      traffic: BASE_TRAFFIC,
      trafficHistory: [BASE_TRAFFIC],
      replicaHistory: [pods.length],
      avgCpu: 25,
      queueDepth: 0,
      metrics: emptyMetrics(maxPods, pods.length),
      logs: [],
      events: [],
      cooldownRemaining: 0,
      scaleDownTimer: 0,
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

      // Process active events to determine traffic
      let traffic = prev.traffic;
      const activeEvents = prev.events.filter((e) => newTick - e.tick < 60);
      const latestEvent = activeEvents[activeEvents.length - 1];

      if (latestEvent) {
        traffic = applyTrafficEvent(traffic, BASE_TRAFFIC, latestEvent.type, newTick - latestEvent.tick);
      } else {
        // Natural jitter
        traffic = BASE_TRAFFIC + (Math.random() - 0.5) * 10;
      }
      traffic = Math.max(5, traffic);

      let newPods = prev.pods;
      let avgCpu = prev.avgCpu;
      let scaleDownTimer = prev.scaleDownTimer;
      let queueDepth = prev.queueDepth;
      const newLogs: LogEntry[] = [];

      // Handle pod crashes from events
      const crashEvents = prev.events.filter((e) => e.type === 'pod_crash' && e.tick === newTick - 1);
      if (crashEvents.length > 0) {
        const running = newPods.filter((p) => p.status === 'running');
        if (running.length > 1) {
          const victim = running[running.length - 1];
          newPods = newPods.filter((p) => p.id !== victim.id);
          newLogs.push(makeLog(`Pod ${victim.label} crashed!`, 'error', newTick));
        }
      }

      // Queue burst for KEDA
      const queueEvents = prev.events.filter((e) => e.type === 'queue_burst' && newTick - e.tick < 30);
      if (queueEvents.length > 0) {
        queueDepth = Math.max(0, 500 - (newTick - queueEvents[0].tick) * 20);
      } else {
        queueDepth = Math.max(0, queueDepth - newPods.filter((p) => p.status === 'running').length * 2);
      }

      // Apply autoscaling logic
      if (simType === 'hpa') {
        const result = hpaTick(newPods, traffic, cfg as HPAConfig, scaleDownTimer);
        newPods = result.pods;
        avgCpu = result.avgCpu;
        scaleDownTimer = result.scaleDownTimer;
        if (result.log && newTick % 3 === 0) {
          newLogs.push(makeLog(result.log, result.log.includes('Scaling') ? 'action' : 'info', newTick));
        }
      } else if (simType === 'keda') {
        const kedaCfg = cfg as KEDAConfig;
        // Only poll at intervals
        if (newTick % kedaCfg.pollingInterval === 0 || newTick === 1) {
          const { desired, log } = kedaDesiredReplicas(queueDepth, kedaCfg);
          const currentCount = newPods.filter((p) => p.status !== 'terminating').length;

          if (desired > currentCount) {
            const toAdd = desired - currentCount;
            const added: SimPod[] = Array.from({ length: toAdd }, (_, i) => ({
              id: `keda-${newTick}-${i}`,
              status: 'pending' as const,
              cpu: 0,
              memory: 0,
              label: `worker-${Math.random().toString(36).slice(2, 7)}`,
            }));
            newPods = [...newPods, ...added];
            if (log) newLogs.push(makeLog(log, 'action', newTick));
          } else if (desired < currentCount && scaleDownTimer >= kedaCfg.cooldownPeriod) {
            // Scale down
            const running = newPods.filter((p) => p.status === 'running');
            if (running.length > desired) {
              newPods = newPods.map((p, i) => {
                if (i >= desired && p.status === 'running') return { ...p, status: 'terminating' as const };
                return p;
              });
              if (log) newLogs.push(makeLog(log, 'action', newTick));
            }
            scaleDownTimer = 0;
          } else if (desired < currentCount) {
            scaleDownTimer++;
          }
        }

        // Promote pending, remove terminated
        newPods = newPods
          .map((p) => p.status === 'pending' ? { ...p, status: 'running' as const, cpu: 30 } : p)
          .filter((p) => p.status !== 'terminating');

        const runCount = newPods.filter((p) => p.status === 'running').length || 1;
        avgCpu = Math.min(95, Math.round((queueDepth / (runCount * 5)) * 60 + Math.random() * 10));
      } else {
        // VPA and Cluster - simplified tick
        const runCount = newPods.filter((p) => p.status === 'running').length || 1;
        avgCpu = Math.min(95, Math.round((traffic / (runCount * 40)) * 60 + Math.random() * 5));
        newPods = newPods.map((p) => p.status === 'running' ? { ...p, cpu: avgCpu + (Math.random() - 0.5) * 10 } : p);
        // Promote pending
        newPods = newPods.map((p) => p.status === 'pending' ? { ...p, status: 'running' as const, cpu: avgCpu * 0.5 } : p);
      }

      // Track healthy ticks
      const isHealthy = avgCpu < 95 && newPods.filter((p) => p.status === 'running').length > 0;
      if (isHealthy) healthyTicksRef.current++;

      const maxPods = simType === 'hpa' ? (cfg as HPAConfig).maxPods
        : simType === 'keda' ? (cfg as KEDAConfig).maxPods
        : 10;

      const metrics = calculateScalingMetrics(
        newPods,
        traffic,
        maxPods,
        avgCpu,
        queueDepth,
        healthyTicksRef.current,
        newTick
      );

      return {
        ...prev,
        tick: newTick,
        pods: newPods,
        traffic,
        trafficHistory: [...prev.trafficHistory.slice(-49), traffic],
        replicaHistory: [...prev.replicaHistory.slice(-49), newPods.filter((p) => p.status !== 'terminating').length],
        avgCpu,
        queueDepth,
        metrics,
        logs: [...prev.logs, ...newLogs].slice(-50),
        events: activeEvents,
        scaleDownTimer,
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
    healthyTicksRef.current = 0;
    const cfg = configRef.current;
    const initialPods = simType === 'hpa' ? (cfg as HPAConfig).initialPods
      : simType === 'keda' ? (cfg as KEDAConfig).minPods
      : simType === 'cluster' ? (cfg as ClusterConfig).podsPerNode
      : 2;
    const maxPods = simType === 'hpa' ? (cfg as HPAConfig).maxPods
      : simType === 'keda' ? (cfg as KEDAConfig).maxPods
      : 10;
    const pods = createInitialPods(Math.max(1, initialPods));
    setState({
      tick: 0,
      pods,
      nodes: [],
      traffic: BASE_TRAFFIC,
      trafficHistory: [BASE_TRAFFIC],
      replicaHistory: [pods.length],
      avgCpu: 25,
      queueDepth: 0,
      metrics: emptyMetrics(maxPods, pods.length),
      logs: [],
      events: [],
      cooldownRemaining: 0,
      scaleDownTimer: 0,
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

  const triggerEvent = useCallback((type: ScalingEventType) => {
    setState((prev) => {
      const event: SimEvent = { type, tick: prev.tick };
      const log = makeLog(
        type === 'traffic_spike_2x' ? 'Traffic spike: 2x load!'
          : type === 'traffic_spike_5x' ? 'Traffic spike: 5x load!'
          : type === 'gradual_ramp' ? 'Gradual traffic ramp started...'
          : type === 'pod_crash' ? 'Simulating pod crash...'
          : type === 'cool_down' ? 'Cooling down traffic to baseline...'
          : type === 'queue_burst' ? 'Queue burst: 500 messages injected!'
          : `Event: ${type}`,
        type === 'pod_crash' ? 'error' : type === 'cool_down' ? 'success' : 'warning',
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
