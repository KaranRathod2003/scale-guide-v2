'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import MetricsGauge from '../MetricsGauge';
import NarrationLog, { type LogEntry } from '../NarrationLog';
import SceneModeSelector, { type SceneMode } from './SceneModeSelector';
import DeploymentScene from './DeploymentScene';
import ModeToggle from '../ModeToggle';
import type { RecreateConfig, EventDef, DeploymentEventType } from '@/lib/simulator/types';
import { useDeploymentSimulation } from '@/lib/simulator/useDeploymentSimulation';
import { getRecreateHints } from '@/lib/simulator/hintEngine';
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
    name: 'CrashLoopBackOff During Maintenance',
    description: 'All v1 pods terminated but v2 pods enter CrashLoopBackOff. No fallback version available. Service is completely down.',
    company: 'EdgePlatform',
  },
  {
    id: 'success',
    name: 'Clean 60s Planned Downtime',
    description: 'Riot Games deploys match history DB schema update during off-peak. All pods terminate cleanly, new pods start and pass health checks in 60 seconds.',
    company: 'Riot Games',
  },
];

let logCounter = 0;
function createLog(message: string, type: LogEntry['type'], time: string): LogEntry {
  return { id: `recreate-log-${++logCounter}`, timestamp: time, message, type };
}

const defaultRecreateConfig: RecreateConfig = {
  replicas: 3,
  startupTime: 3,
  shutdownGrace: 2,
};

const deployEvents: EventDef[] = [
  { type: 'deploy_v2', label: 'Deploy v2', icon: '🚀', description: 'Kill all v1, start v2' },
  { type: 'inject_error', label: 'Break v2', icon: '⚠️', description: 'v2 pods crash on start' },
];

export default function RecreateVisualization() {
  const [mode, setMode] = useState<'stories' | 'simulator'>('stories');

  // ── Story Mode State ──
  const [servers, setServers] = useState<Server[]>([
    { id: 's1', version: 'v1', status: 'running', label: 'gw-pod-1' },
    { id: 's2', version: 'v1', status: 'running', label: 'gw-pod-2' },
    { id: 's3', version: 'v1', status: 'running', label: 'gw-pod-3' },
  ]);
  const [errorRate, setErrorRate] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Simulator Mode ──
  const [simConfig, setSimConfig] = useState<RecreateConfig>(defaultRecreateConfig);
  const sim = useDeploymentSimulation('recreate', simConfig);
  const hints = useMemo(() => getRecreateHints(simConfig), [simConfig]);

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
      { id: 's1', version: 'v1', status: 'running', label: 'gw-pod-1' },
      { id: 's2', version: 'v1', status: 'running', label: 'gw-pod-2' },
      { id: 's3', version: 'v1', status: 'running', label: 'gw-pod-3' },
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

    addLog('Maintenance window started. Terminating all v1 pods...', 'info', '03:00');

    schedule(() => {
      setServers((prev) => prev.map((s) => ({ ...s, status: 'draining' as const })));
      addLog('Draining connections from all 3 pods...', 'action', '03:00');
    }, 2500);

    schedule(() => {
      addLog('All 3 v1 pods terminated. Service is DOWN. Starting v2 pods...', 'warning', '03:01');
      setServers([]);
      setErrorRate(100);
    }, 5000);

    schedule(() => {
      addLog('Creating v2 pods... container image pulling...', 'action', '03:02');
      setServers([
        { id: 'n1', version: 'v2', status: 'deploying', label: 'gw-v2-1' },
        { id: 'n2', version: 'v2', status: 'deploying', label: 'gw-v2-2' },
        { id: 'n3', version: 'v2', status: 'deploying', label: 'gw-v2-3' },
      ]);
    }, 8000);

    schedule(() => {
      addLog('ERROR: v2 pod 1 -- CrashLoopBackOff! Missing environment variable DB_MIGRATION_KEY', 'error', '03:03');
      setServers((prev) => prev.map((s) => ({ ...s, status: 'failing' as const })));
    }, 12000);

    schedule(() => {
      addLog('ERROR: All v2 pods in CrashLoopBackOff. Back-off delay increasing: 10s, 20s, 40s...', 'error', '03:05');
    }, 15000);

    schedule(() => {
      addLog('SERVICE COMPLETELY DOWN. No v1 pods to fall back to!', 'error', '03:06');
    }, 17000);

    schedule(() => {
      addLog('Kubernetes retrying pods with exponential backoff. Next attempt in 80s...', 'warning', '03:08');
    }, 19500);

    schedule(() => {
      addLog('On-call engineer paged. Must fix config and redeploy manually.', 'error', '03:10');
    }, 21500);

    schedule(() => {
      addLog('TOTAL DOWNTIME: 15+ minutes and counting. Root cause: untested config in production.', 'error', '03:15');
    }, 23500);

    schedule(() => {
      addLog('Lesson: Always test in staging first. Recreate has no safety net.', 'warning', '03:20');
      setIsRunning(false);
    }, 25500);
  }, [addLog, schedule]);

  const runSuccess = useCallback(() => {
    setIsRunning(true);
    setActiveScene('success');
    setLogs([]);

    addLog('Riot Games: Off-peak deployment window (3 AM). Announcing 60s maintenance.', 'info', '03:00');

    schedule(() => {
      addLog('Status page updated: "Planned maintenance -- Match History". Terminating v1 pods...', 'action', '03:00');
      setServers((prev) => prev.map((s) => ({ ...s, status: 'draining' as const })));
    }, 3200);

    schedule(() => {
      addLog('All v1 pods gracefully terminated. Service is temporarily unavailable.', 'warning', '03:01');
      setServers([]);
      setErrorRate(100);
    }, 6500);

    schedule(() => {
      addLog('Deploying v2 pods with updated schema. Container images pre-pulled (cached).', 'action', '03:01');
      setServers([
        { id: 'n1', version: 'v2', status: 'deploying', label: 'match-v2-1' },
        { id: 'n2', version: 'v2', status: 'deploying', label: 'match-v2-2' },
        { id: 'n3', version: 'v2', status: 'deploying', label: 'match-v2-3' },
      ]);
    }, 9500);

    schedule(() => {
      addLog('v2 pods running. Readiness probes passing. Schema migration verified.', 'success', '03:02');
      setServers((prev) => prev.map((s) => ({ ...s, status: 'running' as const })));
      setErrorRate(0);
    }, 13000);

    schedule(() => {
      addLog('Service restored! Total downtime: 58 seconds. Status page updated: "Operational"', 'success', '03:02');
    }, 15500);

    schedule(() => {
      addLog('All match history queries returning correct data from new schema.', 'info', '03:05');
      setIsRunning(false);
    }, 18000);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">Recreate Deployment</h3>
          <p className="text-xs text-zinc-300 sm:text-sm">Kill all old pods, then start all new pods</p>
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
          <MetricsGauge value={errorRate} threshold={1} label="Service Availability (inverted)" />
          <DeploymentScene
            servers={servers}
            v1Traffic={servers.filter((s) => s.version === 'v1' && s.status === 'running').length > 0 ? 100 : 0}
            v2Traffic={servers.filter((s) => s.version === 'v2' && s.status === 'running').length > 0 ? 100 : 0}
            isFlowing={servers.filter((s) => s.status === 'running').length > 0}
            v1Label="Old (v1)"
            v2Label="New (v2)"
            deploymentName="edge-gateway"
          />
          <NarrationLog entries={logs} />
        </>
      ) : (
        <>
          <ConfigPanel type="recreate" config={simConfig} onChange={(c) => setSimConfig(c as RecreateConfig)} disabled={sim.isRunning} />
          <SmartHints hints={hints} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TimelineControls isRunning={sim.isRunning} onPlay={sim.start} onPause={sim.pause} onReset={sim.reset} speed={sim.speed} onSpeedChange={sim.changeSpeed} tick={sim.state.tick} />
            <EventTriggerBar events={deployEvents} onTrigger={(t) => sim.triggerEvent(t as DeploymentEventType)} disabled={!sim.isRunning} />
          </div>
          <LiveMetricsBar metrics={sim.state.metrics} />
          <MetricsGauge value={sim.state.errorRate} threshold={1} label="Service Availability" />
          <DeploymentScene
            servers={sim.state.servers}
            v1Traffic={sim.state.v1Traffic}
            v2Traffic={sim.state.v2Traffic}
            isFlowing={sim.state.servers.filter((s) => s.status === 'running').length > 0}
            v1Label="Old (v1)"
            v2Label="New (v2)"
            deploymentName="edge-gateway"
          />
          <NarrationLog entries={sim.state.logs} />
          <SimulatorGuide active={mode === 'simulator'} />
        </>
      )}
    </div>
  );
}
