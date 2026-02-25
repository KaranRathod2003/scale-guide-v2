'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import TrafficSplitBar from './TrafficSplitBar';
import MetricsGauge from '../MetricsGauge';
import NarrationLog, { type LogEntry } from '../NarrationLog';
import SceneModeSelector, { type SceneMode } from './SceneModeSelector';
import DeploymentScene from './DeploymentScene';
import ModeToggle from '../ModeToggle';
import type { CanaryConfig, EventDef, DeploymentEventType } from '@/lib/simulator/types';
import { useDeploymentSimulation } from '@/lib/simulator/useDeploymentSimulation';
import { getCanaryHints } from '@/lib/simulator/hintEngine';
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
    name: 'Missing Relevance Monitoring',
    description: 'Canary deployed for a recommendation engine but only error rate is monitored. Click-through rate drops 40% unnoticed until full rollout.',
    company: 'ShopStream',
  },
  {
    id: 'success',
    name: '36-Hour Gradual Rollout',
    description: 'Netflix validates recommendation engine changes with a 2% canary, monitoring CTR and engagement over 36 hours before promoting.',
    company: 'Netflix',
  },
];

let logCounter = 0;
function createLog(message: string, type: LogEntry['type'], time: string): LogEntry {
  return { id: `canary-log-${++logCounter}`, timestamp: time, message, type };
}

const defaultCanaryConfig: CanaryConfig = {
  stages: [5, 25, 50, 100],
  stageDuration: 5,
  errorThreshold: 3,
};

const deployEvents: EventDef[] = [
  { type: 'deploy_v2', label: 'Deploy Canary', icon: '🚀', description: 'Start canary deployment' },
  { type: 'inject_error', label: 'Inject Error', icon: '⚠️', description: 'Inject errors into canary' },
  { type: 'trigger_rollback', label: 'Rollback', icon: '⏪', description: 'Roll back to stable' },
];

export default function CanaryVisualization() {
  const [mode, setMode] = useState<'stories' | 'simulator'>('stories');

  // ── Story Mode State ──
  const [servers, setServers] = useState<Server[]>([
    { id: 's1', version: 'v1', status: 'running', label: 'rec-api-1' },
    { id: 's2', version: 'v1', status: 'running', label: 'rec-api-2' },
    { id: 's3', version: 'v1', status: 'running', label: 'rec-api-3' },
    { id: 's4', version: 'v1', status: 'running', label: 'rec-api-4' },
  ]);
  const [v1Traffic, setV1Traffic] = useState(100);
  const [v2Traffic, setV2Traffic] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Simulator Mode ──
  const [simConfig, setSimConfig] = useState<CanaryConfig>(defaultCanaryConfig);
  const sim = useDeploymentSimulation('canary', simConfig);
  const hints = useMemo(() => getCanaryHints(simConfig), [simConfig]);

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
      { id: 's1', version: 'v1', status: 'running', label: 'rec-api-1' },
      { id: 's2', version: 'v1', status: 'running', label: 'rec-api-2' },
      { id: 's3', version: 'v1', status: 'running', label: 'rec-api-3' },
      { id: 's4', version: 'v1', status: 'running', label: 'rec-api-4' },
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

    addLog('Deploying canary v2 for recommendation engine. Routing 5% traffic...', 'info', '10:00');
    setServers((prev) => [...prev, { id: 'canary-1', version: 'v2', status: 'deploying', label: 'rec-canary-1' }]);

    schedule(() => {
      addLog('Canary pod running. 5% traffic routed. Error rate: 0.1% (same as stable)', 'success', '10:02');
      setServers((prev) => prev.map((s) => s.id === 'canary-1' ? { ...s, status: 'running' } : s));
      setV1Traffic(95);
      setV2Traffic(5);
    }, 4000);

    schedule(() => {
      addLog('Canary looks healthy! Error rate stable. Promoting to 25%...', 'action', '10:30');
      addLog('WARNING: Only monitoring error rate. No business metric checks configured.', 'warning', '10:30');
      setV1Traffic(75);
      setV2Traffic(25);
    }, 8000);

    schedule(() => {
      addLog('25% canary -- error rate still 0.1%. Promoting to 50%...', 'action', '11:00');
      setV1Traffic(50);
      setV2Traffic(50);
    }, 12000);

    schedule(() => {
      addLog('50% traffic on canary. Error rate nominal. Promoting to 100%!', 'action', '11:30');
      setV1Traffic(0);
      setV2Traffic(100);
      setServers([
        { id: 's1', version: 'v2', status: 'running', label: 'rec-api-1' },
        { id: 's2', version: 'v2', status: 'running', label: 'rec-api-2' },
        { id: 's3', version: 'v2', status: 'running', label: 'rec-api-3' },
        { id: 's4', version: 'v2', status: 'running', label: 'rec-api-4' },
      ]);
    }, 16000);

    schedule(() => {
      addLog('ALERT: Analytics team reports click-through rate dropped 40% since deployment!', 'error', '14:00');
      addLog('Relevance scoring bug in v2 -- recommendations are irrelevant but do not error', 'error', '14:05');
      setErrorRate(0.1);
    }, 20000);

    schedule(() => {
      addLog('INCIDENT: $2.3M revenue impact over 4 hours. Emergency rollback initiated.', 'error', '14:30');
    }, 23000);

    schedule(() => {
      addLog('Root cause: Monitored error rate but not business metrics (CTR, conversion).', 'warning', '15:00');
      setIsRunning(false);
    }, 25000);
  }, [addLog, schedule]);

  const runSuccess = useCallback(() => {
    setIsRunning(true);
    setActiveScene('success');
    setLogs([]);

    addLog('Netflix: Deploying recommendation engine v2 canary. Starting at 2%...', 'info', '06:00');
    setServers((prev) => [...prev, { id: 'canary-1', version: 'v2', status: 'deploying', label: 'rec-canary-1' }]);

    schedule(() => {
      addLog('Canary running. 2% traffic. Monitoring: error rate, CTR, play rate, satisfaction', 'success', '06:05');
      setServers((prev) => prev.map((s) => s.id === 'canary-1' ? { ...s, status: 'running' } : s));
      setV1Traffic(98);
      setV2Traffic(2);
    }, 3200);

    schedule(() => {
      addLog('Hour 6: Canary CTR +1.2%, play rate +0.8%, errors nominal. Holding at 2%...', 'info', '12:00');
    }, 6500);

    schedule(() => {
      addLog('Hour 18: Metrics stable across all dimensions. Promoting to 10%...', 'action', '00:00');
      setV1Traffic(90);
      setV2Traffic(10);
    }, 10000);

    schedule(() => {
      addLog('Hour 24: 10% canary holding. CTR +1.1% sustained. Promoting to 50%...', 'action', '06:00');
      setV1Traffic(50);
      setV2Traffic(50);
    }, 13500);

    schedule(() => {
      addLog('Hour 36: All metrics green across 50% of traffic. Promoting to 100%.', 'success', '18:00');
      setV1Traffic(0);
      setV2Traffic(100);
      setServers([
        { id: 's1', version: 'v2', status: 'running', label: 'rec-v2-1' },
        { id: 's2', version: 'v2', status: 'running', label: 'rec-v2-2' },
        { id: 's3', version: 'v2', status: 'running', label: 'rec-v2-3' },
        { id: 's4', version: 'v2', status: 'running', label: 'rec-v2-4' },
      ]);
    }, 17000);

    schedule(() => {
      addLog('Deployment complete. CTR improvement sustained at +1.1%. Zero incidents.', 'success', '18:30');
      setIsRunning(false);
    }, 20000);
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
          <h3 className="text-base font-semibold text-white sm:text-lg">Canary Deployment</h3>
          <p className="text-xs text-zinc-300 sm:text-sm">Gradually route traffic to the new version</p>
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
            <MetricsGauge value={errorRate} threshold={1} label="Error Rate" />
            <TrafficSplitBar v1Percent={v1Traffic} v2Percent={v2Traffic} />
          </div>
          <DeploymentScene servers={servers} v1Traffic={v1Traffic} v2Traffic={v2Traffic} isFlowing={isRunning && servers.length > 0} v1Label="Stable (v1)" v2Label="Canary (v2)" deploymentName="recommendation-engine" />
          <NarrationLog entries={logs} />
        </>
      ) : (
        <>
          <ConfigPanel type="canary" config={simConfig} onChange={(c) => setSimConfig(c as CanaryConfig)} disabled={sim.isRunning} />
          <SmartHints hints={hints} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TimelineControls isRunning={sim.isRunning} onPlay={sim.start} onPause={sim.pause} onReset={sim.reset} speed={sim.speed} onSpeedChange={sim.changeSpeed} tick={sim.state.tick} />
            <EventTriggerBar events={deployEvents} onTrigger={(t) => sim.triggerEvent(t as DeploymentEventType)} disabled={!sim.isRunning} />
          </div>
          <LiveMetricsBar metrics={sim.state.metrics} />
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricsGauge value={sim.state.errorRate} threshold={3} label="Error Rate" />
            <TrafficSplitBar v1Percent={sim.state.v1Traffic} v2Percent={sim.state.v2Traffic} />
          </div>
          <DeploymentScene
            servers={sim.state.servers}
            v1Traffic={sim.state.v1Traffic}
            v2Traffic={sim.state.v2Traffic}
            isFlowing={sim.isRunning && sim.state.servers.length > 0}
            v1Label="Stable (v1)"
            v2Label="Canary (v2)"
            deploymentName="recommendation-engine"
          />
          <NarrationLog entries={sim.state.logs} />
          <SimulatorGuide active={mode === 'simulator'} />
        </>
      )}
    </div>
  );
}
