'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import TrafficSplitBar from './TrafficSplitBar';
import MetricsGauge from '../MetricsGauge';
import NarrationLog, { type LogEntry } from '../NarrationLog';
import SceneModeSelector, { type SceneMode } from './SceneModeSelector';
import DeploymentScene from './DeploymentScene';
import ModeToggle from '../ModeToggle';
import type { BlueGreenConfig, EventDef, DeploymentEventType } from '@/lib/simulator/types';
import { useDeploymentSimulation } from '@/lib/simulator/useDeploymentSimulation';
import { getBlueGreenHints } from '@/lib/simulator/hintEngine';
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
    name: 'Schema Migration Breaks Rollback',
    description: 'Green environment runs a destructive schema migration. When errors appear, Blue cannot roll back because its code is incompatible with the new schema.',
    company: 'FinanceApp',
  },
  {
    id: 'success',
    name: 'Clean Fare Engine Switch',
    description: 'TfL deploys a new fare calculation engine to Green, validates with synthetic transactions, switches traffic instantly. Old Blue stays warm for instant rollback.',
    company: 'Transport for London',
  },
];

let logCounter = 0;
function createLog(message: string, type: LogEntry['type'], time: string): LogEntry {
  return { id: `bg-log-${++logCounter}`, timestamp: time, message, type };
}

const defaultBlueGreenConfig: BlueGreenConfig = {
  replicas: 3,
  healthCheckDuration: 3,
  rollbackThreshold: 5,
};

const deployEvents: EventDef[] = [
  { type: 'deploy_v2', label: 'Deploy v2', icon: '🚀', description: 'Deploy green environment' },
  { type: 'inject_error', label: 'Inject Error', icon: '⚠️', description: 'Inject errors into v2' },
  { type: 'trigger_rollback', label: 'Rollback', icon: '⏪', description: 'Switch back to blue' },
];

export default function BlueGreenVisualization() {
  const [mode, setMode] = useState<'stories' | 'simulator'>('stories');

  // ── Story Mode State ──
  const [servers, setServers] = useState<Server[]>([
    { id: 's1', version: 'v1', status: 'running', label: 'blue-api-1' },
    { id: 's2', version: 'v1', status: 'running', label: 'blue-api-2' },
    { id: 's3', version: 'v1', status: 'running', label: 'blue-api-3' },
  ]);
  const [v1Traffic, setV1Traffic] = useState(100);
  const [v2Traffic, setV2Traffic] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Simulator Mode ──
  const [simConfig, setSimConfig] = useState<BlueGreenConfig>(defaultBlueGreenConfig);
  const sim = useDeploymentSimulation('blue-green', simConfig);
  const hints = useMemo(() => getBlueGreenHints(simConfig), [simConfig]);

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
      { id: 's1', version: 'v1', status: 'running', label: 'blue-api-1' },
      { id: 's2', version: 'v1', status: 'running', label: 'blue-api-2' },
      { id: 's3', version: 'v1', status: 'running', label: 'blue-api-3' },
    ]);
    setV1Traffic(100);
    setV2Traffic(0);
    setErrorRate(0);
    setIsRunning(false);
    setActiveScene(null);
    setLogs([]);
  }, []);

  const runFailure = useCallback(() => {
    setIsRunning(true);
    setActiveScene('failure');
    setLogs([]);

    addLog('Blue environment serving all traffic. Deploying v2 to Green...', 'info', '09:00');

    schedule(() => {
      addLog('Green v2 deployed. Running destructive schema migration (ALTER TABLE DROP COLUMN)...', 'warning', '09:02');
      setServers((prev) => [
        ...prev,
        { id: 's4', version: 'v2', status: 'deploying', label: 'green-api-1' },
        { id: 's5', version: 'v2', status: 'deploying', label: 'green-api-2' },
        { id: 's6', version: 'v2', status: 'deploying', label: 'green-api-3' },
      ]);
    }, 3200);

    schedule(() => {
      addLog('Schema migration completed. Green pods healthy. Switching traffic Blue → Green...', 'action', '09:05');
      setServers((prev) => prev.map((s) => s.version === 'v2' ? { ...s, status: 'running' } : s));
    }, 6500);

    schedule(() => {
      setV1Traffic(0);
      setV2Traffic(100);
      addLog('GREEN SERVING ALL TRAFFIC. Monitoring...', 'info', '09:06');
      setErrorRate(2);
    }, 9000);

    schedule(() => {
      addLog('ERROR: 500 errors spiking on Green! NullReferenceException on removed column', 'error', '09:08');
      setErrorRate(35);
      setServers((prev) => prev.map((s) => s.version === 'v2' ? { ...s, status: 'failing' } : s));
    }, 13000);

    schedule(() => {
      addLog('ROLLBACK ATTEMPT: Switching traffic back to Blue...', 'action', '09:09');
      setV1Traffic(100);
      setV2Traffic(0);
    }, 16500);

    schedule(() => {
      addLog('ROLLBACK FAILED: Blue v1 code reads dropped column. Both environments broken!', 'error', '09:10');
      setErrorRate(65);
      setServers((prev) => prev.map((s) => ({ ...s, status: 'failing' })));
    }, 19500);

    schedule(() => {
      addLog('INCIDENT: Database schema is incompatible with both v1 and v2. Manual intervention required.', 'error', '09:12');
    }, 22000);

    schedule(() => {
      addLog('Root cause: Destructive migration without expand-and-contract pattern.', 'warning', '09:15');
      setIsRunning(false);
    }, 24000);
  }, [addLog, schedule]);

  const runSuccess = useCallback(() => {
    setIsRunning(true);
    setActiveScene('success');
    setLogs([]);

    addLog('Blue (v1) serving all fare calculations. Deploying v2 to Green...', 'info', '02:00');

    schedule(() => {
      addLog('Green v2 deployed with new fare engine. Running smoke tests...', 'action', '02:03');
      setServers((prev) => [
        ...prev,
        { id: 's4', version: 'v2', status: 'deploying', label: 'green-fare-1' },
        { id: 's5', version: 'v2', status: 'deploying', label: 'green-fare-2' },
        { id: 's6', version: 'v2', status: 'deploying', label: 'green-fare-3' },
      ]);
    }, 3200);

    schedule(() => {
      addLog('Smoke tests passed: 10,000 synthetic fare calculations match expected values', 'success', '02:05');
      setServers((prev) => prev.map((s) => s.version === 'v2' ? { ...s, status: 'running' } : s));
    }, 6500);

    schedule(() => {
      addLog('Switching traffic Blue → Green. Instant cutover via load balancer rule.', 'action', '02:06');
      setV1Traffic(0);
      setV2Traffic(100);
    }, 10000);

    schedule(() => {
      addLog('Green serving 100% traffic. Error rate: 0.01%. Latency: 12ms (same as Blue)', 'success', '02:08');
      setErrorRate(0);
    }, 13000);

    schedule(() => {
      addLog('Blue (v1) kept warm for 30 min rollback window. No issues detected.', 'info', '02:15');
    }, 16000);

    schedule(() => {
      addLog('Deployment successful. Blue environment recycled for next deployment.', 'success', '02:35');
      setServers((prev) => prev.filter((s) => s.version === 'v2'));
      setIsRunning(false);
    }, 18500);
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
          <h3 className="text-base font-semibold text-white sm:text-lg">Blue-Green Deployment</h3>
          <p className="text-xs text-zinc-300 sm:text-sm">Two identical environments with instant traffic switch</p>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricsGauge value={errorRate} threshold={5} label="Error Rate" />
            <TrafficSplitBar v1Percent={v1Traffic} v2Percent={v2Traffic} />
          </div>
          <DeploymentScene servers={servers} v1Traffic={v1Traffic} v2Traffic={v2Traffic} isFlowing={isRunning && servers.length > 0} v1Label="Blue (v1)" v2Label="Green (v2)" deploymentName="fare-engine" />
          <NarrationLog entries={logs} />
        </>
      ) : (
        <>
          <ConfigPanel type="blue-green" config={simConfig} onChange={(c) => setSimConfig(c as BlueGreenConfig)} disabled={sim.isRunning} />
          <SmartHints hints={hints} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TimelineControls isRunning={sim.isRunning} onPlay={sim.start} onPause={sim.pause} onReset={sim.reset} speed={sim.speed} onSpeedChange={sim.changeSpeed} tick={sim.state.tick} />
            <EventTriggerBar events={deployEvents} onTrigger={(t) => sim.triggerEvent(t as DeploymentEventType)} disabled={!sim.isRunning} />
          </div>
          <LiveMetricsBar metrics={sim.state.metrics} />
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricsGauge value={sim.state.errorRate} threshold={5} label="Error Rate" />
            <TrafficSplitBar v1Percent={sim.state.v1Traffic} v2Percent={sim.state.v2Traffic} />
          </div>
          <DeploymentScene
            servers={sim.state.servers}
            v1Traffic={sim.state.v1Traffic}
            v2Traffic={sim.state.v2Traffic}
            isFlowing={sim.isRunning && sim.state.servers.length > 0}
            v1Label="Blue (v1)"
            v2Label="Green (v2)"
            deploymentName="fare-engine"
          />
          <NarrationLog entries={sim.state.logs} />
          <SimulatorGuide active={mode === 'simulator'} />
        </>
      )}
    </div>
  );
}
