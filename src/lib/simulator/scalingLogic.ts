import type { HPAConfig, VPAConfig, ClusterConfig, KEDAConfig, SimPod, SimNode } from './types';

// ── HPA Logic ──

export function hpaDesiredReplicas(
  currentReplicas: number,
  avgCpu: number,
  config: HPAConfig
): number {
  const desired = Math.ceil(currentReplicas * (avgCpu / config.cpuTarget));
  return Math.max(config.minPods, Math.min(config.maxPods, desired));
}

export function hpaTick(
  pods: SimPod[],
  traffic: number,
  config: HPAConfig,
  scaleDownTimer: number
): { pods: SimPod[]; avgCpu: number; scaleDownTimer: number; log?: string } {
  const runningPods = pods.filter((p) => p.status === 'running');
  const pendingPods = pods.filter((p) => p.status === 'pending');
  const runningCount = runningPods.length || 1;

  // CPU is proportional to traffic / running pods (with some randomness)
  const baseCpu = Math.min(95, (traffic / runningCount) * 0.8 + Math.random() * 5);
  const avgCpu = Math.round(baseCpu);

  // Update running pod CPUs
  const updatedPods = pods.map((p) => {
    if (p.status === 'pending') {
      // Pending pods become running after ~3 ticks
      return { ...p, cpu: 0 };
    }
    if (p.status === 'terminating') return p;
    return { ...p, cpu: Math.round(baseCpu + (Math.random() - 0.5) * 10) };
  });

  // Promote pending pods (simulate startup time)
  const finalPods = updatedPods.map((p) => {
    if (p.status === 'pending') {
      return { ...p, status: 'running' as const, cpu: Math.round(baseCpu * 0.5) };
    }
    return p;
  });

  // Remove terminated pods
  const alivePods = finalPods.filter((p) => p.status !== 'terminating');

  const desired = hpaDesiredReplicas(runningCount + pendingPods.length, avgCpu, config);
  const current = alivePods.length;

  let log: string | undefined;
  let newScaleDownTimer = scaleDownTimer;

  if (desired > current) {
    // Scale up immediately
    const toAdd = Math.min(desired - current, Math.max(1, Math.ceil(current * 0.5))); // max 50% increase per tick
    const newPods: SimPod[] = Array.from({ length: toAdd }, (_, i) => ({
      id: `sim-pod-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
      status: 'pending' as const,
      cpu: 0,
      memory: 0,
      label: `pod-${Math.random().toString(36).slice(2, 7)}`,
    }));
    log = `HPA: ceil(${runningCount} x ${avgCpu}/${config.cpuTarget}) = ${desired}. Scaling ${current} -> ${current + toAdd}`;
    return { pods: [...alivePods, ...newPods], avgCpu, scaleDownTimer: 0, log };
  }

  if (desired < current) {
    newScaleDownTimer++;
    if (newScaleDownTimer >= config.scaleDownDelay) {
      // Scale down by 1 at a time
      const toRemove = Math.min(current - desired, 1);
      const marked = [...alivePods];
      for (let i = marked.length - 1; i >= 0 && toRemove > 0; i--) {
        if (marked[i].status === 'running' && marked.length - 1 >= config.minPods) {
          marked[i] = { ...marked[i], status: 'terminating' };
          break;
        }
      }
      log = `HPA: CPU ${avgCpu}% < target ${config.cpuTarget}%. Scale-down: ${current} -> ${desired}`;
      return { pods: marked, avgCpu, scaleDownTimer: 0, log };
    }
    log = `HPA: CPU ${avgCpu}% below target. Scale-down cooldown: ${newScaleDownTimer}/${config.scaleDownDelay}`;
    return { pods: alivePods, avgCpu, scaleDownTimer: newScaleDownTimer, log };
  }

  return { pods: alivePods, avgCpu, scaleDownTimer: 0 };
}

// ── VPA Logic ──

export interface VPARecommendation {
  cpuMillis: number;
  memoryMi: number;
  log?: string;
}

export function vpaRecommend(
  currentCpu: number,
  currentMemory: number,
  usageCpuPercent: number,
  usageMemoryPercent: number,
  config: VPAConfig
): VPARecommendation {
  if (config.updateMode === 'Off') {
    return { cpuMillis: currentCpu, memoryMi: currentMemory };
  }

  const usedCpu = (usageCpuPercent / 100) * currentCpu;
  const usedMem = (usageMemoryPercent / 100) * currentMemory;

  // VPA recommends 20% headroom above observed usage
  const recCpu = Math.min(config.maxCpuMillis, Math.round(usedCpu * 1.2));
  const recMem = Math.min(config.maxMemoryMi, Math.round(usedMem * 1.2));

  let log: string | undefined;
  if (Math.abs(recCpu - currentCpu) > currentCpu * 0.15 || Math.abs(recMem - currentMemory) > currentMemory * 0.15) {
    log = `VPA: Recommending ${recCpu}m CPU, ${recMem}Mi memory (current: ${currentCpu}m, ${currentMemory}Mi)`;
  }

  return { cpuMillis: recCpu, memoryMi: recMem, log };
}

// ── Cluster Autoscaler Logic ──

export function clusterDesiredNodes(
  nodes: SimNode[],
  pendingPods: number,
  config: ClusterConfig
): { desired: number; log?: string } {
  const currentNodes = nodes.length;

  // Check if there are unschedulable pods
  if (pendingPods > 0) {
    const nodesNeeded = Math.ceil(pendingPods / config.podsPerNode);
    const desired = Math.min(config.maxNodes, currentNodes + nodesNeeded);
    return {
      desired,
      log: `Cluster Autoscaler: ${pendingPods} pending pods. Adding ${desired - currentNodes} node(s)`,
    };
  }

  // Check if nodes are underutilized
  const avgUtil = nodes.reduce((sum, n) => sum + (n.cpuUsed / n.capacity) * 100, 0) / (currentNodes || 1);
  if (avgUtil < config.scaleDownThreshold && currentNodes > config.minNodes) {
    return {
      desired: Math.max(config.minNodes, currentNodes - 1),
      log: `Cluster Autoscaler: Avg utilization ${Math.round(avgUtil)}% < ${config.scaleDownThreshold}%. Removing 1 node`,
    };
  }

  return { desired: currentNodes };
}

// ── KEDA Logic ──

export function kedaDesiredReplicas(
  queueDepth: number,
  config: KEDAConfig
): { desired: number; log?: string } {
  if (queueDepth === 0 && config.minPods === 0) {
    return { desired: 0, log: 'KEDA: Queue empty. Scaling to zero.' };
  }

  const desired = Math.max(
    config.minPods,
    Math.min(config.maxPods, Math.ceil(queueDepth / config.queueThreshold))
  );

  return {
    desired,
    log: `KEDA: ceil(${queueDepth} / ${config.queueThreshold}) = ${desired} pods needed`,
  };
}

// ── Traffic Simulation ──

export function applyTrafficEvent(
  current: number,
  baseTraffic: number,
  eventType: string,
  ticksSinceEvent: number
): number {
  switch (eventType) {
    case 'traffic_spike_2x':
      return baseTraffic * 2;
    case 'traffic_spike_5x':
      return baseTraffic * 5;
    case 'gradual_ramp':
      return baseTraffic * (1 + Math.min(ticksSinceEvent / 60, 3)); // ramp up to 4x over 60 ticks
    case 'cool_down':
      return Math.max(baseTraffic, current * 0.85); // decay 15% per tick
    case 'queue_burst':
      return current; // doesn't affect traffic, affects queue
    default:
      return current;
  }
}
