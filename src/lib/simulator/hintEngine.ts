import type {
  HPAConfig, VPAConfig, ClusterConfig, KEDAConfig,
  CanaryConfig, BlueGreenConfig, RollingConfig, RecreateConfig,
  ABTestingConfig, ShadowConfig,
  Hint,
} from './types';

let hintId = 0;
function hint(type: Hint['type'], message: string): Hint {
  return { id: `hint-${++hintId}`, type, message };
}

// ── HPA Hints ──

export function getHPAHints(config: HPAConfig): Hint[] {
  const hints: Hint[] = [];

  if (config.cpuTarget > 70)
    hints.push(hint('warning', 'CPU target > 70% is aggressive. Leaves no headroom for spikes before scaling kicks in.'));
  else if (config.cpuTarget < 40)
    hints.push(hint('tip', 'CPU target < 40% will keep many pods running. Good responsiveness, but higher cost.'));
  else if (config.cpuTarget >= 50 && config.cpuTarget <= 65)
    hints.push(hint('success', 'CPU target 50-65% is well-balanced for most web workloads.'));

  if (config.scaleDownDelay < 3)
    hints.push(hint('warning', 'Short scale-down delay causes "flapping" - pods scale down then immediately back up.'));
  else if (config.scaleDownDelay >= 5 && config.scaleDownDelay <= 10)
    hints.push(hint('success', 'Good scale-down delay. Prevents oscillation without wasting resources.'));

  if (config.maxPods < 5)
    hints.push(hint('warning', 'Low max pod cap may cause request drops during traffic spikes.'));

  if (config.minPods >= config.maxPods)
    hints.push(hint('warning', 'Min pods equals max pods - autoscaling is effectively disabled.'));

  if (config.initialPods > config.maxPods)
    hints.push(hint('warning', 'Initial pods exceeds max - HPA will immediately try to scale down.'));

  return hints;
}

// ── VPA Hints ──

export function getVPAHints(config: VPAConfig): Hint[] {
  const hints: Hint[] = [];

  if (config.updateMode === 'Off')
    hints.push(hint('tip', 'Update mode "Off" means VPA only recommends - it won\'t auto-resize. Good for observing first.'));

  if (config.initialCpuMillis > config.maxCpuMillis * 0.8)
    hints.push(hint('warning', 'Initial CPU is near max limit. VPA has little room to scale up.'));

  if (config.maxMemoryMi < 1024)
    hints.push(hint('tip', 'Max memory < 1Gi can cause OOMKills for memory-intensive apps like Java.'));

  if (config.initialCpuMillis < 250)
    hints.push(hint('tip', 'Low initial CPU (< 250m) means slow startup. Good for batch jobs, risky for user-facing services.'));

  return hints;
}

// ── Cluster Autoscaler Hints ──

export function getClusterHints(config: ClusterConfig): Hint[] {
  const hints: Hint[] = [];

  if (config.provisioningTime > 120)
    hints.push(hint('warning', 'Node provisioning > 2 minutes. Pods will be pending a long time during spikes.'));

  if (config.scaleDownThreshold < 30)
    hints.push(hint('tip', 'Very low scale-down threshold (< 30%) keeps nodes running even when mostly idle.'));
  else if (config.scaleDownThreshold > 70)
    hints.push(hint('warning', 'High scale-down threshold (> 70%) aggressively removes nodes. Risk of re-provisioning churn.'));

  if (config.podsPerNode > 12)
    hints.push(hint('tip', 'Many pods per node. A single node failure impacts more workloads.'));

  if (config.maxNodes <= config.minNodes)
    hints.push(hint('warning', 'Max nodes equals min. Cluster autoscaling is effectively disabled.'));

  return hints;
}

// ── KEDA Hints ──

export function getKEDAHints(config: KEDAConfig): Hint[] {
  const hints: Hint[] = [];

  if (config.minPods === 0)
    hints.push(hint('tip', 'Scale-to-zero enabled! First message will have cold-start latency (~5-15s).'));

  if (config.queueThreshold < 2)
    hints.push(hint('warning', 'Very low queue threshold. Even 1 message triggers a pod. May cause over-scaling.'));
  else if (config.queueThreshold > 20)
    hints.push(hint('tip', 'High threshold means fewer pods but higher per-pod load. Good for batch processing.'));

  if (config.cooldownPeriod < 3)
    hints.push(hint('warning', 'Short cooldown risks scale-to-zero flapping during intermittent traffic.'));

  if (config.pollingInterval > 30)
    hints.push(hint('tip', 'Long polling interval (> 30s) means slower reaction to queue spikes.'));

  return hints;
}

// ── Deployment Hints ──

export function getCanaryHints(config: CanaryConfig): Hint[] {
  const hints: Hint[] = [];

  if (config.stages.length > 0 && config.stages[0] > 10)
    hints.push(hint('warning', 'Starting canary at > 10% is risky. Netflix starts at 2%.'));
  else if (config.stages.length > 0 && config.stages[0] <= 5)
    hints.push(hint('success', 'Conservative first stage. Limits blast radius during rollout.'));

  if (config.stageDuration < 3)
    hints.push(hint('warning', 'Short stage duration may miss slow-manifesting bugs.'));

  if (config.errorThreshold > 5)
    hints.push(hint('warning', 'High error threshold (> 5%) means tolerating significant errors before rollback.'));
  else if (config.errorThreshold <= 2)
    hints.push(hint('success', 'Tight error threshold. Will catch problems quickly.'));

  return hints;
}

export function getBlueGreenHints(config: BlueGreenConfig): Hint[] {
  const hints: Hint[] = [];

  if (config.healthCheckDuration < 2)
    hints.push(hint('warning', 'Short health check may not catch startup issues. Risk of switching to unhealthy env.'));

  if (config.rollbackThreshold > 5)
    hints.push(hint('warning', 'High rollback threshold. Users may see errors before auto-rollback triggers.'));

  if (config.replicas < 2)
    hints.push(hint('tip', 'Single replica blue-green means no redundancy in either environment.'));

  return hints;
}

export function getRollingHints(config: RollingConfig): Hint[] {
  const hints: Hint[] = [];

  if (config.maxUnavailable > 1 && config.replicas <= 3)
    hints.push(hint('warning', 'maxUnavailable > 1 with few replicas means significant capacity loss during rollout.'));

  if (config.maxSurge === 0 && config.maxUnavailable === 0)
    hints.push(hint('warning', 'Both maxSurge and maxUnavailable at 0 means no progress is possible!'));

  if (config.maxSurge > 2)
    hints.push(hint('tip', 'High maxSurge speeds up rollout but temporarily doubles resource usage.'));

  return hints;
}

export function getRecreateHints(config: RecreateConfig): Hint[] {
  const hints: Hint[] = [];

  hints.push(hint('warning', 'Recreate strategy causes downtime between shutdown and startup. Not for production-critical services.'));

  if (config.startupTime > 5)
    hints.push(hint('tip', 'Long startup time means extended downtime window. Consider rolling update instead.'));

  return hints;
}

export function getABTestingHints(config: ABTestingConfig): Hint[] {
  const hints: Hint[] = [];

  if (config.v1Percent + config.v2Percent !== 100)
    hints.push(hint('warning', 'Traffic split should add up to 100%.'));

  if (config.v2Percent > 50)
    hints.push(hint('tip', 'Sending > 50% to v2 means it\'s the primary. Are you sure v2 is ready?'));

  return hints;
}

export function getShadowHints(config: ShadowConfig): Hint[] {
  const hints: Hint[] = [];

  if (config.mirrorPercent === 100)
    hints.push(hint('success', 'Mirroring 100% of traffic gives complete comparison data.'));
  else if (config.mirrorPercent < 50)
    hints.push(hint('tip', 'Low mirror percentage may miss edge cases. Consider 100% for full validation.'));

  hints.push(hint('tip', 'Shadow mode must disable ALL write paths in the shadow: DB, cache, queues, external APIs.'));

  return hints;
}
