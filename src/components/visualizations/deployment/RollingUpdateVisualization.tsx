'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import MetricsGauge from '../MetricsGauge';
import NarrationLog, { type LogEntry } from '../NarrationLog';
import SceneModeSelector, { type SceneMode } from './SceneModeSelector';
import DeploymentScene from './DeploymentScene';
import ModeToggle from '../ModeToggle';
import type { RollingConfig, EventDef, DeploymentEventType } from '@/lib/simulator/types';
import { useDeploymentSimulation } from '@/lib/simulator/useDeploymentSimulation';
import { getRollingHints } from '@/lib/simulator/hintEngine';
import ConfigPanel from '../simulator/ConfigPanel';
import EventTriggerBar from '../simulator/EventTriggerBar';
import TimelineControls from '../simulator/TimelineControls';
import LiveMetricsBar from '../simulator/LiveMetricsBar';
import SmartHints from '../simulator/SmartHints';
import SimulatorGuide from '../simulator/SimulatorGuide';

interface Server {
  id: string;
  version: 'v1' | 'v2';
  status: 'running' | 'deploying' | 'failing' | 'draining' | 'stopped';
  label: string;
}

const scenes: SceneMode[] = [
  {
    id: 'failure',
    name: 'API Incompatibility in Mixed State',
    description: 'During rolling update, v2 pods send a new response format that v1 pods cannot parse. Mixed-version window causes cascading errors.',
    company: 'RetailAPI',
  },
  {
    id: 'success',
    name: 'Zero-Error Price Update Rollout',
    description: 'Target rolls out price service updates one pod at a time with readiness probes ensuring each pod validates price calculations before serving traffic.',
    company: 'Target',
  },
];

let logCounter = 0;
function createLog(message: string, type: LogEntry['type'], time: string): LogEntry {
  return { id: `rolling-log-${++logCounter}`, timestamp: time, message, type };
}

const defaultRollingConfig: RollingConfig = {
  replicas: 4,
  maxSurge: 1,
  maxUnavailable: 1,
  readinessDelay: 2,
};

const deployEvents: EventDef[] = [
  { type: 'deploy_v2', label: 'Start Rollout', icon: '🚀', description: 'Begin rolling update' },
  { type: 'inject_error', label: 'Inject Error', icon: '⚠️', description: 'Inject errors into v2 pods' },
  { type: 'trigger_rollback', label: 'Rollback', icon: '⏪', description: 'kubectl rollout undo' },
];

export default function RollingUpdateVisualization() {
  const [mode, setMode] = useState<'stories' | 'simulator'>('stories');

  // ── Story Mode State ──
  const [servers, setServers] = useState<Server[]>([
    { id: 's1', version: 'v1', status: 'running', label: 'api-pod-1' },
    { id: 's2', version: 'v1', status: 'running', label: 'api-pod-2' },
    { id: 's3', version: 'v1', status: 'running', label: 'api-pod-3' },
    { id: 's4', version: 'v1', status: 'running', label: 'api-pod-4' },
  ]);
  const [errorRate, setErrorRate] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Simulator Mode ──
  const [simConfig, setSimConfig] = useState<RollingConfig>(defaultRollingConfig);
  const sim = useDeploymentSimulation('rolling', simConfig);
  const hints = useMemo(() => getRollingHints(simConfig), [simConfig]);

  const addLog = useCallback((message: string, type: LogEntry['type'], time: string) => {
    setLogs((prev) => [...prev, createLog(message, type, time)]);
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }, []);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setServers([
      { id: 's1', version: 'v1', status: 'running', label: 'api-pod-1' },
      { id: 's2', version: 'v1', status: 'running', label: 'api-pod-2' },
      { id: 's3', version: 'v1', status: 'running', label: 'api-pod-3' },
      { id: 's4', version: 'v1', status: 'running', label: 'api-pod-4' },
    ]);
    setErrorRate(0);
    setIsRunning(false);
    setActiveScene(null);
    setLogs([]);
  }, []);

  const runFailure = useCallback(() => {
    setIsRunning(true);
    setActiveScene('failure');
    setLogs([]);

    addLog('Starting rolling update. maxSurge=1, maxUnavailable=1. Replacing pod 1...', 'info', '14:00');

    schedule(() => {
      addLog('Pod 1 draining. New v2 pod starting...', 'action', '14:01');
      setServers([
        { id: 's1', version: 'v1', status: 'draining', label: 'api-pod-1' },
        { id: 's2', version: 'v1', status: 'running', label: 'api-pod-2' },
        { id: 's3', version: 'v1', status: 'running', label: 'api-pod-3' },
        { id: 's4', version: 'v1', status: 'running', label: 'api-pod-4' },
        { id: 'n1', version: 'v2', status: 'deploying', label: 'api-v2-1' },
      ]);
    }, 3200);

    schedule(() => {
      addLog('v2 pod 1 running. Mixed state: 3 x v1 + 1 x v2 serving traffic', 'info', '14:02');
      setServers([
        { id: 's2', version: 'v1', status: 'running', label: 'api-pod-2' },
        { id: 's3', version: 'v1', status: 'running', label: 'api-pod-3' },
        { id: 's4', version: 'v1', status: 'running', label: 'api-pod-4' },
        { id: 'n1', version: 'v2', status: 'running', label: 'api-v2-1' },
      ]);
    }, 6500);

    schedule(() => {
      addLog('Replacing pod 2... v2 sends new JSON format, v1 pods cannot parse it', 'action', '14:03');
      setServers([
        { id: 's2', version: 'v1', status: 'draining', label: 'api-pod-2' },
        { id: 's3', version: 'v1', status: 'running', label: 'api-pod-3' },
        { id: 's4', version: 'v1', status: 'running', label: 'api-pod-4' },
        { id: 'n1', version: 'v2', status: 'running', label: 'api-v2-1' },
        { id: 'n2', version: 'v2', status: 'deploying', label: 'api-v2-2' },
      ]);
    }, 10000);

    schedule(() => {
      addLog('ERROR: Inter-service calls failing. v1 pods receive v2 response format and crash!', 'error', '14:04');
      setErrorRate(28);
      setServers([
        { id: 's3', version: 'v1', status: 'failing', label: 'api-pod-3' },
        { id: 's4', version: 'v1', status: 'failing', label: 'api-pod-4' },
        { id: 'n1', version: 'v2', status: 'running', label: 'api-v2-1' },
        { id: 'n2', version: 'v2', status: 'running', label: 'api-v2-2' },
      ]);
    }, 14000);

    schedule(() => {
      addLog('CASCADING FAILURE: Mixed v1/v2 state causes 28% error rate across all pods', 'error', '14:05');
      setErrorRate(35);
    }, 17000);

    schedule(() => {
      addLog('kubectl rollout undo triggered. Rolling back to v1...', 'action', '14:06');
    }, 19000);

    schedule(() => {
      addLog('Rollback in progress but takes time -- must replace v2 pods back to v1 one by one', 'warning', '14:08');
    }, 21000);

    schedule(() => {
      addLog('Root cause: Breaking API change without versioning. v1 and v2 cannot coexist.', 'error', '14:12');
      setIsRunning(false);
    }, 23000);
  }, [addLog, schedule]);

  const runSuccess = useCallback(() => {
    setIsRunning(true);
    setActiveScene('success');
    setLogs([]);

    addLog('Target: Rolling update for price-service. maxSurge=1, maxUnavailable=0', 'info', '03:00');

    schedule(() => {
      addLog('Creating v2 pod 1 (surge). Readiness probe checks price calculation accuracy...', 'action', '03:01');
      setServers((prev) => [...prev, { id: 'n1', version: 'v2', status: 'deploying', label: 'price-v2-1' }]);
    }, 3200);

    schedule(() => {
      addLog('v2 pod 1 passed readiness. Price check: $12.99 matches expected. Draining v1 pod 1...', 'success', '03:02');
      setServers([
        { id: 's1', version: 'v1', status: 'draining', label: 'price-pod-1' },
        { id: 's2', version: 'v1', status: 'running', label: 'price-pod-2' },
        { id: 's3', version: 'v1', status: 'running', label: 'price-pod-3' },
        { id: 's4', version: 'v1', status: 'running', label: 'price-pod-4' },
        { id: 'n1', version: 'v2', status: 'running', label: 'price-v2-1' },
      ]);
    }, 6500);

    schedule(() => {
      addLog('Pod 2 replaced. 2 v2 + 2 v1 running. API backward compatible -- zero errors.', 'success', '03:04');
      setServers([
        { id: 's3', version: 'v1', status: 'running', label: 'price-pod-3' },
        { id: 's4', version: 'v1', status: 'running', label: 'price-pod-4' },
        { id: 'n1', version: 'v2', status: 'running', label: 'price-v2-1' },
        { id: 'n2', version: 'v2', status: 'running', label: 'price-v2-2' },
      ]);
    }, 10000);

    schedule(() => {
      addLog('Pod 3 replaced. 3 v2 + 1 v1. Error rate: 0.00%. Prices consistent.', 'success', '03:06');
      setServers([
        { id: 's4', version: 'v1', status: 'running', label: 'price-pod-4' },
        { id: 'n1', version: 'v2', status: 'running', label: 'price-v2-1' },
        { id: 'n2', version: 'v2', status: 'running', label: 'price-v2-2' },
        { id: 'n3', version: 'v2', status: 'running', label: 'price-v2-3' },
      ]);
    }, 13500);

    schedule(() => {
      addLog('Pod 4 replaced. All 4 pods now on v2. Rolling update complete!', 'success', '03:08');
      setServers([
        { id: 'n1', version: 'v2', status: 'running', label: 'price-v2-1' },
        { id: 'n2', version: 'v2', status: 'running', label: 'price-v2-2' },
        { id: 'n3', version: 'v2', status: 'running', label: 'price-v2-3' },
        { id: 'n4', version: 'v2', status: 'running', label: 'price-v2-4' },
      ]);
    }, 17000);

    schedule(() => {
      addLog('Deployment verified. Zero errors during entire rollout. 6,000+ price queries served.', 'success', '03:10');
      setIsRunning(false);
    }, 19500);
  }, [addLog, schedule]);

  const handleSceneSelect = useCallback((id: 'failure' | 'success') => {
    reset();
    setTimeout(() => {
      if (id === 'failure') runFailure();
      else runSuccess();
    }, 100);
  }, [reset, runFailure, runSuccess]);

  const handleModeChange = useCallback((newMode: 'stories' | 'simulator') => {
    if (newMode === 'stories') {
      sim.pause();
      sim.reset();
    } else {
      reset();
    }
    setMode(newMode);
  }, [reset, sim]);

  // Computed traffic for story mode
  const storyV1Traffic = servers.filter((s) => s.version === 'v1' && s.status === 'running').length > 0
    ? 100 - (servers.filter((s) => s.version === 'v2' && s.status === 'running').length / Math.max(servers.filter((s) => s.status === 'running').length, 1) * 100)
    : 0;
  const storyV2Traffic = servers.filter((s) => s.version === 'v2' && s.status === 'running').length > 0
    ? (servers.filter((s) => s.version === 'v2' && s.status === 'running').length / Math.max(servers.filter((s) => s.status === 'running').length, 1) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">Rolling Update</h3>
          <p className="text-xs text-zinc-300 sm:text-sm">Replace pods one at a time (Kubernetes default)</p>
        </div>
        <ModeToggle mode={mode} onChange={handleModeChange} />
      </div>

      {mode === 'stories' ? (
        <>
          {isRunning && (
            <button onClick={reset} className="self-start rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-400 hover:text-white sm:px-4 sm:py-2">
              Reset
            </button>
          )}
          <SceneModeSelector scenes={scenes} activeScene={activeScene} onSelect={handleSceneSelect} disabled={isRunning} />
          <MetricsGauge value={errorRate} threshold={5} label="Error Rate" />
          <DeploymentScene
            servers={servers}
            v1Traffic={storyV1Traffic}
            v2Traffic={storyV2Traffic}
            isFlowing={isRunning && servers.filter((s) => s.status === 'running').length > 0}
            v1Label="Old (v1)"
            v2Label="New (v2)"
            deploymentName="price-service"
          />
          <NarrationLog entries={logs} />
        </>
      ) : (
        <>
          <ConfigPanel type="rolling" config={simConfig} onChange={(c) => setSimConfig(c as RollingConfig)} disabled={sim.isRunning} />
          <SmartHints hints={hints} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TimelineControls isRunning={sim.isRunning} onPlay={sim.start} onPause={sim.pause} onReset={sim.reset} speed={sim.speed} onSpeedChange={sim.changeSpeed} tick={sim.state.tick} />
            <EventTriggerBar events={deployEvents} onTrigger={(t) => sim.triggerEvent(t as DeploymentEventType)} disabled={!sim.isRunning} />
          </div>
          <LiveMetricsBar metrics={sim.state.metrics} />
          <MetricsGauge value={sim.state.errorRate} threshold={5} label="Error Rate" />
          <DeploymentScene
            servers={sim.state.servers}
            v1Traffic={sim.state.v1Traffic}
            v2Traffic={sim.state.v2Traffic}
            isFlowing={sim.isRunning && sim.state.servers.filter((s) => s.status === 'running').length > 0}
            v1Label="Old (v1)"
            v2Label="New (v2)"
            deploymentName="price-service"
          />
          <NarrationLog entries={sim.state.logs} />
          <SimulatorGuide active={mode === 'simulator'} />
        </>
      )}
    </div>
  );
}
