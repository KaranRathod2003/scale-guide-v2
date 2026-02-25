import type { SimPod, SimServer, LiveMetrics } from './types';

const COST_PER_POD_PER_HOUR = 0.05;
const BASE_LATENCY_MS = 12;

export function calculateScalingMetrics(
  pods: SimPod[],
  traffic: number,
  maxPods: number,
  avgCpu: number,
  queueDepth: number,
  healthyTicks: number,
  totalTicks: number
): LiveMetrics {
  const runningPods = pods.filter((p) => p.status === 'running');
  const podCount = runningPods.length || 1;

  // Non-linear latency: degrades sharply when load per pod is high
  const loadPerPod = traffic / podCount;
  const latencyMs = Math.round(BASE_LATENCY_MS * (1 + Math.pow(loadPerPod / 80, 1.5)));

  // Availability drops when pods are overloaded or pending
  const pendingPods = pods.filter((p) => p.status === 'pending').length;
  const overloaded = avgCpu > 90 ? 1 : 0;
  const availability =
    totalTicks === 0
      ? 100
      : Math.max(0, Math.min(100, ((healthyTicks - overloaded - pendingPods * 0.5) / Math.max(totalTicks, 1)) * 100));

  return {
    podCount,
    maxPods,
    cpuPercent: Math.min(100, avgCpu),
    costPerHour: Math.round(podCount * COST_PER_POD_PER_HOUR * 100) / 100,
    availability: Math.round(availability * 10) / 10,
    latencyMs: Math.min(5000, latencyMs),
    traffic: Math.round(traffic),
    queueDepth,
  };
}

export function calculateDeploymentMetrics(
  servers: SimServer[],
  v1Traffic: number,
  v2Traffic: number,
  errorRate: number,
  healthyTicks: number,
  totalTicks: number
): LiveMetrics {
  const runningServers = servers.filter((s) => s.status === 'running');
  const totalTraffic = v1Traffic + v2Traffic;
  const serverCount = runningServers.length || 1;

  const loadPerServer = totalTraffic / serverCount;
  const latencyMs = Math.round(BASE_LATENCY_MS * (1 + Math.pow(loadPerServer / 80, 1.2)));

  const availability =
    totalTicks === 0
      ? 100
      : Math.max(0, Math.min(100, ((healthyTicks) / Math.max(totalTicks, 1)) * 100 - errorRate));

  return {
    podCount: serverCount,
    maxPods: servers.length,
    cpuPercent: Math.min(100, Math.round((totalTraffic / (serverCount * 50)) * 100)),
    costPerHour: Math.round(serverCount * COST_PER_POD_PER_HOUR * 100) / 100,
    availability: Math.round(availability * 10) / 10,
    latencyMs: Math.min(5000, latencyMs),
    traffic: Math.round(totalTraffic),
  };
}
