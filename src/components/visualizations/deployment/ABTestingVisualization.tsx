'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import TrafficSplitBar from './TrafficSplitBar';
import MetricsGauge from '../MetricsGauge';
import NarrationLog, { type LogEntry } from '../NarrationLog';
import SceneModeSelector, { type SceneMode } from './SceneModeSelector';
import DeploymentScene from './DeploymentScene';
import ModeToggle from '../ModeToggle';
import type { ABTestingConfig, EventDef, DeploymentEventType } from '@/lib/simulator/types';
import { useDeploymentSimulation } from '@/lib/simulator/useDeploymentSimulation';
import { getABTestingHints } from '@/lib/simulator/hintEngine';
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
    name: 'Unmonitored Bounce Rate Increase',
    description: 'A/B test runs for 2 weeks but only conversion is tracked. Variant B causes 25% bounce rate increase that erodes long-term brand trust.',
    company: 'ShopFront',
  },
  {
    id: 'success',
    name: '18% Metric Improvement Found',
    description: 'Uber A/B tests surge pricing display format. Flat fare estimate vs multiplier. After 3 weeks, flat fare shows 18% higher ride acceptance.',
    company: 'Uber',
  },
];

let logCounter = 0;
function createLog(message: string, type: LogEntry['type'], time: string): LogEntry {
  return { id: `ab-log-${++logCounter}`, timestamp: time, message, type };
}

const defaultABTestingConfig: ABTestingConfig = {
  v1Percent: 50,
  v2Percent: 50,
  replicas: 4,
};

const deployEvents: EventDef[] = [
  { type: 'deploy_v2', label: 'Start Test', icon: '🧪', description: 'Begin A/B test' },
  { type: 'inject_error', label: 'Inject Error', icon: '⚠️', description: 'Variant B errors' },
  { type: 'trigger_rollback', label: 'Promote A', icon: '⏪', description: 'End test, promote A' },
];

export default function ABTestingVisualization() {
  const [mode, setMode] = useState<'stories' | 'simulator'>('stories');

  // ── Story Mode State ──
  const [servers, setServers] = useState<Server[]>([
    { id: 's1', version: 'v1', status: 'running', label: 'checkout-a-1' },
    { id: 's2', version: 'v1', status: 'running', label: 'checkout-a-2' },
    { id: 's3', version: 'v2', status: 'running', label: 'checkout-b-1' },
    { id: 's4', version: 'v2', status: 'running', label: 'checkout-b-2' },
  ]);
  const [v1Traffic, setV1Traffic] = useState(50);
  const [v2Traffic, setV2Traffic] = useState(50);
  const [errorRate, setErrorRate] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Simulator Mode ──
  const [simConfig, setSimConfig] = useState<ABTestingConfig>(defaultABTestingConfig);
  const sim = useDeploymentSimulation('ab-testing', simConfig);
  const hints = useMemo(() => getABTestingHints(simConfig), [simConfig]);

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
      { id: 's1', version: 'v1', status: 'running', label: 'checkout-a-1' },
      { id: 's2', version: 'v1', status: 'running', label: 'checkout-a-2' },
      { id: 's3', version: 'v2', status: 'running', label: 'checkout-b-1' },
      { id: 's4', version: 'v2', status: 'running', label: 'checkout-b-2' },
    ]);
    setV1Traffic(50);
    setV2Traffic(50);
    setErrorRate(0);
    setIsRunning(false);
    setActiveScene(null);
    setLogs([]);
  }, []);

  const runFailure = useCallback(() => {
    setIsRunning(true);
    setActiveScene('failure');
    setLogs([]);

    addLog('A/B test started. Variant A (control) vs Variant B (new checkout flow). 50/50 split.', 'info', 'Day 1');

    schedule(() => {
      addLog('Day 3: Conversion rate -- A: 4.2%, B: 4.5%. B looks promising! Monitoring only conversion.', 'info', 'Day 3');
    }, 4000);

    schedule(() => {
      addLog('Day 7: Conversion rate -- A: 4.1%, B: 4.6%. B winning! But no bounce rate monitoring...', 'info', 'Day 7');
    }, 8000);

    schedule(() => {
      addLog('Day 14: Experiment concludes. B wins on conversion: 4.6% vs 4.1%. Promoting B!', 'action', 'Day 14');
      setV1Traffic(0);
      setV2Traffic(100);
      setServers([
        { id: 's1', version: 'v2', status: 'running', label: 'checkout-b-1' },
        { id: 's2', version: 'v2', status: 'running', label: 'checkout-b-2' },
        { id: 's3', version: 'v2', status: 'running', label: 'checkout-b-3' },
        { id: 's4', version: 'v2', status: 'running', label: 'checkout-b-4' },
      ]);
    }, 12000);

    schedule(() => {
      addLog('Day 21: Analytics deep-dive reveals bounce rate was 25% HIGHER on Variant B!', 'error', 'Day 21');
    }, 16000);

    schedule(() => {
      addLog('Users who bounced never converted. B only looked better because it filtered out unhappy users.', 'error', 'Day 21');
    }, 18000);

    schedule(() => {
      addLog('Net impact: -15% overall engagement, -8% returning visitors. Reverting to A.', 'error', 'Day 22');
    }, 20500);

    schedule(() => {
      addLog('Root cause: Tracked conversion but ignored bounce rate, session duration, and return visits.', 'warning', 'Day 22');
      setIsRunning(false);
    }, 23000);
  }, [addLog, schedule]);

  const runSuccess = useCallback(() => {
    setIsRunning(true);
    setActiveScene('success');
    setLogs([]);

    addLog('Uber: A/B test -- surge display format. A: multiplier (2.3x), B: flat fare ($34.50)', 'info', 'Day 1');

    schedule(() => {
      addLog('Routing by user ID hash. 50/50 split. Tracking: acceptance rate, cancellation, NPS', 'info', 'Day 1');
    }, 2500);

    schedule(() => {
      addLog('Day 3: Acceptance -- A: 62%, B: 68%. B showing early promise across all segments.', 'info', 'Day 3');
    }, 5500);

    schedule(() => {
      addLog('Day 7: Acceptance -- A: 61%, B: 71%. Cancellation: A: 12%, B: 8%. B winning all metrics!', 'info', 'Day 7');
    }, 9000);

    schedule(() => {
      addLog('Day 14: Statistical significance reached (p < 0.01). B: +18% acceptance, -33% cancellation', 'success', 'Day 14');
    }, 12500);

    schedule(() => {
      addLog('NPS scores: A: 3.2/5, B: 3.8/5. Flat fare is clearer and more trusted by riders.', 'info', 'Day 14');
    }, 14500);

    schedule(() => {
      addLog('Day 21: Extended test confirms results across all geo-zones and time windows.', 'success', 'Day 21');
    }, 17000);

    schedule(() => {
      addLog('Decision: Promote flat fare display (B) to 100% of users globally.', 'action', 'Day 21');
      setV1Traffic(0);
      setV2Traffic(100);
      setServers([
        { id: 's1', version: 'v2', status: 'running', label: 'surge-b-1' },
        { id: 's2', version: 'v2', status: 'running', label: 'surge-b-2' },
        { id: 's3', version: 'v2', status: 'running', label: 'surge-b-3' },
        { id: 's4', version: 'v2', status: 'running', label: 'surge-b-4' },
      ]);
    }, 19500);

    schedule(() => {
      addLog('Global rollout complete. +18% ride acceptance sustained. $340M annual revenue impact.', 'success', 'Day 28');
      setIsRunning(false);
    }, 22000);
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
          <h3 className="text-base font-semibold text-white sm:text-lg">A/B Testing Deployment</h3>
          <p className="text-xs text-zinc-300 sm:text-sm">Route user segments to measure business impact</p>
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
            <TrafficSplitBar v1Percent={v1Traffic} v2Percent={v2Traffic} label="A/B Traffic Split" />
          </div>
          <DeploymentScene servers={servers} v1Traffic={v1Traffic} v2Traffic={v2Traffic} isFlowing={isRunning && servers.length > 0} variant="ab-testing" v1Label="Variant A" v2Label="Variant B" deploymentName="checkout-flow" />
          <NarrationLog entries={logs} />
        </>
      ) : (
        <>
          <ConfigPanel type="ab-testing" config={simConfig} onChange={(c) => setSimConfig(c as ABTestingConfig)} disabled={sim.isRunning} />
          <SmartHints hints={hints} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TimelineControls isRunning={sim.isRunning} onPlay={sim.start} onPause={sim.pause} onReset={sim.reset} speed={sim.speed} onSpeedChange={sim.changeSpeed} tick={sim.state.tick} />
            <EventTriggerBar events={deployEvents} onTrigger={(t) => sim.triggerEvent(t as DeploymentEventType)} disabled={!sim.isRunning} />
          </div>
          <LiveMetricsBar metrics={sim.state.metrics} />
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricsGauge value={sim.state.errorRate} threshold={5} label="Error Rate" />
            <TrafficSplitBar v1Percent={sim.state.v1Traffic} v2Percent={sim.state.v2Traffic} label="A/B Traffic Split" />
          </div>
          <DeploymentScene
            servers={sim.state.servers}
            v1Traffic={sim.state.v1Traffic}
            v2Traffic={sim.state.v2Traffic}
            isFlowing={sim.isRunning && sim.state.servers.length > 0}
            variant="ab-testing"
            v1Label="Variant A"
            v2Label="Variant B"
            deploymentName="checkout-flow"
          />
          <NarrationLog entries={sim.state.logs} />
          <SimulatorGuide active={mode === 'simulator'} />
        </>
      )}
    </div>
  );
}
