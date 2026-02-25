'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import MetricsGauge from '../MetricsGauge';
import DeploymentScene from './DeploymentScene';
import NarrationLog, { type LogEntry } from '../NarrationLog';
import SceneModeSelector, { type SceneMode } from './SceneModeSelector';
import ModeToggle from '../ModeToggle';
import type { ShadowConfig, EventDef, DeploymentEventType } from '@/lib/simulator/types';
import { useDeploymentSimulation } from '@/lib/simulator/useDeploymentSimulation';
import { getShadowHints } from '@/lib/simulator/hintEngine';
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
  isShadow?: boolean;
}

const scenes: SceneMode[] = [
  {
    id: 'failure',
    name: 'Shadow Contaminates Shared Redis',
    description: 'Shadow version writes to the same Redis cache as production, corrupting pricing data for live users.',
    company: 'PriceEngine',
  },
  {
    id: 'success',
    name: '3-Week Zero-Risk Validation',
    description: 'Delta Airlines mirrors fare requests to a shadow pricing model for 3 weeks. Shadow has isolated storage. Validated 4% revenue improvement.',
    company: 'Delta Airlines',
  },
];

let logCounter = 0;
function createLog(message: string, type: LogEntry['type'], time: string): LogEntry {
  return { id: `shadow-log-${++logCounter}`, timestamp: time, message, type };
}

const defaultShadowConfig: ShadowConfig = {
  mirrorPercent: 100,
  replicas: 3,
};

const deployEvents: EventDef[] = [
  { type: 'deploy_v2', label: 'Deploy Shadow', icon: '🔮', description: 'Start mirroring traffic' },
  { type: 'inject_error', label: 'Contaminate', icon: '⚠️', description: 'Shadow writes to prod cache' },
  { type: 'trigger_rollback', label: 'Remove', icon: '⏪', description: 'Remove shadow pods' },
];

export default function ShadowVisualization() {
  const [mode, setMode] = useState<'stories' | 'simulator'>('stories');

  // ── Story Mode State ──
  const [servers, setServers] = useState<Server[]>([
    { id: 's1', version: 'v1', status: 'running', label: 'pricing-1' },
    { id: 's2', version: 'v1', status: 'running', label: 'pricing-2' },
    { id: 's3', version: 'v1', status: 'running', label: 'pricing-3' },
  ]);
  const [errorRate, setErrorRate] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Simulator Mode ──
  const [simConfig, setSimConfig] = useState<ShadowConfig>(defaultShadowConfig);
  const sim = useDeploymentSimulation('shadow', simConfig);
  const hints = useMemo(() => getShadowHints(simConfig), [simConfig]);

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
      { id: 's1', version: 'v1', status: 'running', label: 'pricing-1' },
      { id: 's2', version: 'v1', status: 'running', label: 'pricing-2' },
      { id: 's3', version: 'v1', status: 'running', label: 'pricing-3' },
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

    addLog('Deploying shadow pricing model v2. Mirroring 100% of fare requests...', 'info', '09:00');

    schedule(() => {
      addLog('Shadow pods deployed. Traffic mirrored via Istio VirtualService.', 'action', '09:05');
      setServers((prev) => [
        ...prev,
        { id: 'sh1', version: 'v2', status: 'deploying', label: 'shadow-1', isShadow: true },
        { id: 'sh2', version: 'v2', status: 'deploying', label: 'shadow-2', isShadow: true },
        { id: 'sh3', version: 'v2', status: 'deploying', label: 'shadow-3', isShadow: true },
      ]);
    }, 3200);

    schedule(() => {
      addLog('Shadow processing mirrored requests. Responses discarded (as expected).', 'info', '09:10');
      setServers((prev) => prev.map((s) => s.isShadow ? { ...s, status: 'running' as const } : s));
    }, 6500);

    schedule(() => {
      addLog('WARNING: Shadow v2 writing computed prices to shared Redis cache!', 'warning', '09:30');
    }, 10000);

    schedule(() => {
      addLog('Shadow code path includes cache.set() that was not disabled in shadow mode!', 'error', '09:31');
    }, 12500);

    schedule(() => {
      addLog('ALERT: Production pods reading corrupted prices from Redis! Users seeing wrong fares!', 'error', '09:35');
      setErrorRate(0);
      setServers((prev) => prev.map((s) => !s.isShadow ? { ...s, status: 'failing' as const } : s));
    }, 15000);

    schedule(() => {
      addLog('INCIDENT: 15,000 bookings with incorrect pricing. Shadow contaminated production cache.', 'error', '09:40');
    }, 18000);

    schedule(() => {
      addLog('Emergency: Flushing Redis cache and killing shadow pods.', 'action', '09:42');
      setServers((prev) => prev.filter((s) => !s.isShadow).map((s) => ({ ...s, status: 'running' as const })));
    }, 20500);

    schedule(() => {
      addLog('Cache flushed. Production recovering. 15,000 refunds required.', 'warning', '09:50');
    }, 23000);

    schedule(() => {
      addLog('Root cause: Shadow mode must disable ALL write paths (DB, cache, queues, APIs).', 'error', '10:00');
      setIsRunning(false);
    }, 25000);
  }, [addLog, schedule]);

  const runSuccess = useCallback(() => {
    setIsRunning(true);
    setActiveScene('success');
    setLogs([]);

    addLog('Delta: Deploying shadow pricing model v2 with fully isolated storage.', 'info', 'Week 0');

    schedule(() => {
      addLog('Shadow config: SHADOW_MODE=true, separate Redis instance, no external API calls.', 'info', 'Week 0');
    }, 2500);

    schedule(() => {
      addLog('Shadow pods deployed. Mirroring 100% of fare requests. Responses logged, not returned.', 'action', 'Week 0');
      setServers((prev) => [
        ...prev,
        { id: 'sh1', version: 'v2', status: 'deploying', label: 'shadow-1', isShadow: true },
        { id: 'sh2', version: 'v2', status: 'deploying', label: 'shadow-2', isShadow: true },
        { id: 'sh3', version: 'v2', status: 'deploying', label: 'shadow-3', isShadow: true },
      ]);
    }, 4500);

    schedule(() => {
      addLog('Week 1: Shadow processed 2.1M mirrored requests. Comparing prices...', 'info', 'Week 1');
      setServers((prev) => prev.map((s) => s.isShadow ? { ...s, status: 'running' as const } : s));
    }, 7500);

    schedule(() => {
      addLog('Shadow vs production diff: 89% identical, 11% differ by 2-8%. Analyzing...', 'info', 'Week 1');
    }, 10000);

    schedule(() => {
      addLog('Week 2: Price differences are intentional (better demand modeling). No bugs found.', 'success', 'Week 2');
    }, 13000);

    schedule(() => {
      addLog('Shadow latency: 23ms avg (production: 21ms). Acceptable 2ms overhead.', 'info', 'Week 2');
    }, 15500);

    schedule(() => {
      addLog('Week 3: Revenue simulation shows shadow model yields +4.1% revenue on same bookings.', 'success', 'Week 3');
    }, 18000);

    schedule(() => {
      addLog('Zero production impact. Zero data contamination. Shadow validated safely.', 'success', 'Week 3');
    }, 20000);

    schedule(() => {
      addLog('Decision: Promote shadow to canary deployment (5% real traffic) next sprint.', 'action', 'Week 3');
    }, 22000);

    schedule(() => {
      addLog('Shadow validation complete. 3 weeks, 6.3M requests compared, zero risk to users.', 'success', 'Week 3');
      setIsRunning(false);
    }, 24000);
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
          <h3 className="text-base font-semibold text-white sm:text-lg">Shadow (Dark) Deployment</h3>
          <p className="text-xs text-zinc-300 sm:text-sm">Mirror traffic to new version, discard responses</p>
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
          <MetricsGauge value={errorRate} threshold={1} label="Production Error Rate" />
          <DeploymentScene
            servers={servers}
            v1Traffic={100}
            v2Traffic={servers.filter((s) => s.isShadow && s.status === 'running').length > 0 ? 100 : 0}
            isFlowing={isRunning && servers.filter((s) => !s.isShadow).length > 0}
            variant="shadow"
            v1Label="Production (v1)"
            v2Label="Shadow (v2)"
            deploymentName="pricing-engine"
          />
          <NarrationLog entries={logs} />
        </>
      ) : (
        <>
          <ConfigPanel type="shadow" config={simConfig} onChange={(c) => setSimConfig(c as ShadowConfig)} disabled={sim.isRunning} />
          <SmartHints hints={hints} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TimelineControls isRunning={sim.isRunning} onPlay={sim.start} onPause={sim.pause} onReset={sim.reset} speed={sim.speed} onSpeedChange={sim.changeSpeed} tick={sim.state.tick} />
            <EventTriggerBar events={deployEvents} onTrigger={(t) => sim.triggerEvent(t as DeploymentEventType)} disabled={!sim.isRunning} />
          </div>
          <LiveMetricsBar metrics={sim.state.metrics} />
          <MetricsGauge value={sim.state.errorRate} threshold={1} label="Production Error Rate" />
          <DeploymentScene
            servers={sim.state.servers}
            v1Traffic={sim.state.v1Traffic}
            v2Traffic={sim.state.v2Traffic}
            isFlowing={sim.isRunning && sim.state.servers.filter((s) => !s.isShadow).length > 0}
            variant="shadow"
            v1Label="Production (v1)"
            v2Label="Shadow (v2)"
            deploymentName="pricing-engine"
          />
          <NarrationLog entries={sim.state.logs} />
          <SimulatorGuide active={mode === 'simulator'} />
        </>
      )}
    </div>
  );
}
