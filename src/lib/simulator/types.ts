import type { LogEntry } from '@/components/visualizations/NarrationLog';

// ── Shared Types ──

export type SimSpeed = 1 | 2 | 4;

export interface SimPod {
  id: string;
  status: 'running' | 'pending' | 'terminating';
  cpu: number;
  memory: number;
  label: string;
}

export interface SimNode {
  id: string;
  pods: SimPod[];
  capacity: number;
  cpuUsed: number;
}

export interface SimServer {
  id: string;
  version: 'v1' | 'v2';
  status: 'running' | 'deploying' | 'failing' | 'draining' | 'stopped';
  label: string;
  isShadow?: boolean;
  errorRate?: number;
}

export interface LiveMetrics {
  podCount: number;
  maxPods: number;
  cpuPercent: number;
  costPerHour: number;
  availability: number;
  latencyMs: number;
  traffic: number;
  queueDepth?: number;
}

export interface Hint {
  id: string;
  type: 'tip' | 'warning' | 'success';
  message: string;
}

// ── Scaling Configs ──

export interface HPAConfig {
  initialPods: number;
  minPods: number;
  maxPods: number;
  cpuTarget: number;
  scaleDownDelay: number; // in ticks (each tick = 1 simulated unit)
}

export interface VPAConfig {
  initialCpuMillis: number;
  initialMemoryMi: number;
  maxCpuMillis: number;
  maxMemoryMi: number;
  updateMode: 'Auto' | 'Off';
}

export interface ClusterConfig {
  minNodes: number;
  maxNodes: number;
  podsPerNode: number;
  scaleDownThreshold: number; // % utilization
  provisioningTime: number; // ticks
}

export interface KEDAConfig {
  minPods: number;
  maxPods: number;
  queueThreshold: number; // messages per pod
  cooldownPeriod: number; // ticks
  pollingInterval: number; // ticks
}

export type ScalingConfig = HPAConfig | VPAConfig | ClusterConfig | KEDAConfig;

// ── Deployment Configs ──

export interface BlueGreenConfig {
  replicas: number;
  healthCheckDuration: number; // ticks
  rollbackThreshold: number; // error % to auto-rollback
}

export interface CanaryConfig {
  stages: number[]; // e.g. [5, 25, 50, 100]
  stageDuration: number; // ticks per stage
  errorThreshold: number; // % errors that trigger rollback
}

export interface RollingConfig {
  replicas: number;
  maxSurge: number;
  maxUnavailable: number;
  readinessDelay: number; // ticks
}

export interface RecreateConfig {
  replicas: number;
  startupTime: number; // ticks
  shutdownGrace: number; // ticks
}

export interface ABTestingConfig {
  v1Percent: number;
  v2Percent: number;
  replicas: number;
}

export interface ShadowConfig {
  mirrorPercent: number;
  replicas: number;
}

export type DeploymentConfig =
  | BlueGreenConfig
  | CanaryConfig
  | RollingConfig
  | RecreateConfig
  | ABTestingConfig
  | ShadowConfig;

// ── Simulation Events ──

export type ScalingEventType =
  | 'traffic_spike_2x'
  | 'traffic_spike_5x'
  | 'gradual_ramp'
  | 'pod_crash'
  | 'cool_down'
  | 'queue_burst';

export type DeploymentEventType =
  | 'deploy_v2'
  | 'inject_error'
  | 'trigger_rollback';

export interface SimEvent {
  type: ScalingEventType | DeploymentEventType;
  tick: number; // when it was triggered
}

// ── Event Definitions (for UI buttons) ──

export interface EventDef {
  type: ScalingEventType | DeploymentEventType;
  label: string;
  icon: string;
  description: string;
}

// ── Simulation State ──

export interface ScalingSimState {
  tick: number;
  pods: SimPod[];
  nodes: SimNode[];
  traffic: number; // current req/s (normalized 0-100 base)
  trafficHistory: number[];
  replicaHistory: number[];
  avgCpu: number;
  queueDepth: number;
  metrics: LiveMetrics;
  logs: LogEntry[];
  events: SimEvent[];
  cooldownRemaining: number;
  scaleDownTimer: number;
}

export interface DeploymentSimState {
  tick: number;
  servers: SimServer[];
  v1Traffic: number;
  v2Traffic: number;
  errorRate: number;
  metrics: LiveMetrics;
  logs: LogEntry[];
  events: SimEvent[];
  phase: 'idle' | 'deploying' | 'monitoring' | 'rolling-back' | 'complete';
  currentStage?: number; // for canary
}

// ── Presets ──

export interface ConfigPreset {
  name: string;
  description: string;
  config: Record<string, number | string | number[]>;
}
