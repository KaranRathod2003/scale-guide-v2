'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PodIcon from './PodIcon';
import MetricsGauge from './MetricsGauge';
import NarrationLog, { type LogEntry } from './NarrationLog';
import ScenarioSelector, { type Scenario } from './ScenarioSelector';
import TrafficGraph from './TrafficGraph';
import ScalingScene from './ScalingScene';
import ModeToggle from './ModeToggle';
import ConfigPanel from './simulator/ConfigPanel';
import EventTriggerBar from './simulator/EventTriggerBar';
import TimelineControls from './simulator/TimelineControls';
import LiveMetricsBar from './simulator/LiveMetricsBar';
import SmartHints from './simulator/SmartHints';
import SimulatorGuide from './simulator/SimulatorGuide';
import { useSimulation } from '@/lib/simulator/useSimulation';
import { getHPAHints } from '@/lib/simulator/hintEngine';
import type { HPAConfig, EventDef } from '@/lib/simulator/types';

interface Pod {
  id: string;
  status: 'running' | 'pending' | 'terminating';
  cpu: number;
  label?: string;
}

const scenarios: Scenario[] = [
  {
    id: 'hotstar-ipl',
    name: 'IPL Match Day',
    description: 'Disney+ Hotstar scales from 100 to 1,500 pods when an IPL cricket match goes live. 25M+ concurrent viewers hit the streaming API.',
    company: 'Disney+ Hotstar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6" /><polygon points="6.5,5 11.5,8 6.5,11" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'netflix-evening',
    name: 'Evening Peak Traffic',
    description: 'Netflix gradually scales its API gateway from 200 to 800 pods between 6 PM - 9 PM as viewers return home. Smooth, predictable ramp.',
    company: 'Netflix',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 13V3l6 5 6-5v10" />
      </svg>
    ),
  },
  {
    id: 'uber-surge',
    name: 'Surge Pricing Spike',
    description: 'Uber\'s pricing service sees 10x request rate when it starts raining. HPA scales pods in waves as each wave absorbs partial load.',
    company: 'Uber',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 2v2M8 12v2M3 8H1M15 8h-2M4.9 4.9L3.5 3.5M12.5 12.5l-1.4-1.4" />
      </svg>
    ),
  },
];

const hpaEvents: EventDef[] = [
  { type: 'traffic_spike_2x', label: 'Spike 2x', icon: '\uD83D\uDD25', description: 'Double current traffic instantly' },
  { type: 'traffic_spike_5x', label: 'Spike 5x', icon: '\uD83D\uDD25', description: '5x traffic - test burst handling' },
  { type: 'gradual_ramp', label: 'Ramp', icon: '\uD83D\uDCC8', description: 'Slowly increase traffic over 60 ticks' },
  { type: 'pod_crash', label: 'Crash', icon: '\uD83D\uDC80', description: 'Kill 1 running pod' },
  { type: 'cool_down', label: 'Cool', icon: '\uD83E\uDDCA', description: 'Return to baseline traffic' },
];

let logCounter = 0;
function createLog(message: string, type: LogEntry['type'], time: string): LogEntry {
  return { id: `log-${++logCounter}`, timestamp: time, message, type };
}

const defaultHPAConfig: HPAConfig = {
  initialPods: 2,
  minPods: 1,
  maxPods: 10,
  cpuTarget: 60,
  scaleDownDelay: 5,
};

export default function HPAVisualization() {
  const [mode, setMode] = useState<'stories' | 'simulator'>('stories');

  // ── Simulator state ──
  const [simConfig, setSimConfig] = useState<HPAConfig>(defaultHPAConfig);
  const sim = useSimulation('hpa', simConfig);
  const hints = useMemo(() => getHPAHints(simConfig), [simConfig]);

  // ── Story state ──
  const [pods, setPods] = useState<Pod[]>([
    { id: 'pod-1', status: 'running', cpu: 30, label: 'web-api-7d4f8' },
    { id: 'pod-2', status: 'running', cpu: 25, label: 'web-api-9b2c1' },
  ]);
  const [avgCpu, setAvgCpu] = useState(28);
  const [isRunning, setIsRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [trafficPoints, setTrafficPoints] = useState<number[]>([50, 55, 48, 52, 50]);
  const [replicaHistory, setReplicaHistory] = useState<number[]>([2, 2, 2, 2, 2]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addLog = useCallback((message: string, type: LogEntry['type'], time: string) => {
    setLogs((prev) => [...prev, createLog(message, type, time)]);
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setPods([
      { id: 'pod-1', status: 'running', cpu: 30, label: 'web-api-7d4f8' },
      { id: 'pod-2', status: 'running', cpu: 25, label: 'web-api-9b2c1' },
    ]);
    setAvgCpu(28);
    setIsRunning(false);
    setActiveScenario(null);
    setLogs([]);
    setTrafficPoints([50, 55, 48, 52, 50]);
    setReplicaHistory([2, 2, 2, 2, 2]);
  }, []);

  // ── Story scenarios (unchanged) ──

  const runHotstarIPL = useCallback(() => {
    setIsRunning(true);
    setActiveScenario('hotstar-ipl');
    setLogs([]);

    addLog('IPL match starting in 5 minutes. Pre-match traffic building...', 'info', '18:55:00');
    setTrafficPoints([50, 55, 65, 80, 100]);
    setPods((prev) => prev.map((p) => ({ ...p, cpu: 45 })));
    setAvgCpu(45);

    scheduleTimeout(() => {
      addLog('Toss completed. Viewers flooding in. Request rate: 2,500 req/s \u2192 8,000 req/s', 'warning', '19:00:12');
      setTrafficPoints((prev) => [...prev, 200, 350, 500]);
      setAvgCpu(72);
      setPods((prev) => prev.map((p) => ({ ...p, cpu: 72 })));
    }, 2000);

    scheduleTimeout(() => {
      addLog('HPA: CPU utilization 72% exceeds target 60%. Calculating desired replicas...', 'action', '19:00:27');
      addLog('HPA: desiredReplicas = ceil(2 * (72/60)) = ceil(2.4) = 3. Scaling 2 \u2192 3', 'action', '19:00:28');
      setAvgCpu(78);
      const newPod: Pod = { id: `pod-${Date.now()}-0`, status: 'pending', cpu: 0, label: 'web-api-k8s41' };
      setPods((prev) => [...prev, newPod]);
      setReplicaHistory((prev) => [...prev, 3]);
    }, 3500);

    scheduleTimeout(() => {
      addLog('Pod web-api-k8s41 is Running. But traffic still climbing to 15,000 req/s', 'success', '19:01:05');
      setTrafficPoints((prev) => [...prev, 700, 900, 1200]);
      setPods((prev) => prev.map((p) => ({ ...p, status: 'running', cpu: p.cpu || 80 })));
      setAvgCpu(82);
    }, 5000);

    scheduleTimeout(() => {
      addLog('First ball bowled! 25 million concurrent viewers. Request rate: 22,000 req/s', 'error', '19:01:30');
      addLog('HPA: CPU 82% still above target. desiredReplicas = ceil(3 * (82/60)) = 5. Scaling 3 \u2192 5', 'action', '19:01:32');
      setTrafficPoints((prev) => [...prev, 1800, 2200]);
      const wave2: Pod[] = [
        { id: `pod-${Date.now()}-1`, status: 'pending', cpu: 0, label: 'web-api-m3x7p' },
        { id: `pod-${Date.now()}-2`, status: 'pending', cpu: 0, label: 'web-api-q9w2r' },
      ];
      setPods((prev) => [...prev, ...wave2]);
      setReplicaHistory((prev) => [...prev, 5]);
    }, 7000);

    scheduleTimeout(() => {
      addLog('WICKET! Virat Kohli out for a duck. Replay requests spike to 35,000 req/s', 'error', '19:03:15');
      addLog('HPA: Scaling 5 \u2192 8 pods (scale-up policy allows 100% increase per 60s)', 'action', '19:03:18');
      setPods((prev) => {
        const running = prev.map((p) => ({ ...p, status: 'running' as const, cpu: 85 }));
        const wave3: Pod[] = Array.from({ length: 3 }, (_, i) => ({
          id: `pod-${Date.now()}-wave3-${i}`,
          status: 'pending' as const,
          cpu: 0,
          label: `web-api-${['a1b2c', 'x7y8z', 'h4j5k'][i]}`,
        }));
        return [...running, ...wave3];
      });
      setAvgCpu(88);
      setTrafficPoints((prev) => [...prev, 3000, 3500]);
      setReplicaHistory((prev) => [...prev, 8]);
    }, 9000);

    scheduleTimeout(() => {
      addLog('All 8 pods Running. Load distributed. Average CPU settling to 48%', 'success', '19:04:02');
      addLog('HPA: CPU 48% below target 60%. No scaling action needed.', 'info', '19:04:17');
      setPods((prev) => prev.map((p) => ({ ...p, status: 'running', cpu: 42 + Math.random() * 15 })));
      setAvgCpu(48);
      setTrafficPoints((prev) => [...prev, 3200, 3000]);
      setReplicaHistory((prev) => [...prev, 8]);
    }, 11500);

    scheduleTimeout(() => {
      addLog('Match in progress. Traffic stable at 28,000 req/s across 8 pods.', 'success', '19:15:00');
      addLog('Each pod handles ~3,500 req/s. CPU utilization: 48%. System healthy.', 'info', '19:15:01');
      setTrafficPoints((prev) => [...prev, 2800, 2800]);
      setIsRunning(false);
    }, 14000);
  }, [addLog, scheduleTimeout]);

  const runNetflixEvening = useCallback(() => {
    setIsRunning(true);
    setActiveScenario('netflix-evening');
    setLogs([]);

    addLog('5:30 PM - Afternoon traffic. 2 pods handling steady 500 req/s', 'info', '17:30:00');
    setTrafficPoints([50, 52, 55, 53, 55]);
    setAvgCpu(32);

    scheduleTimeout(() => {
      addLog('6:00 PM - Users returning home. Traffic climbing: 500 \u2192 800 req/s', 'info', '18:00:00');
      setTrafficPoints((prev) => [...prev, 80, 100, 120]);
      setAvgCpu(52);
      setPods((prev) => prev.map((p) => ({ ...p, cpu: 52 })));
    }, 2000);

    scheduleTimeout(() => {
      addLog('6:15 PM - Traffic at 1,200 req/s. CPU at 62%', 'info', '18:15:00');
      addLog('HPA: CPU approaching target. desiredReplicas = ceil(2 * (62/50)) = 3', 'action', '18:15:15');
      setTrafficPoints((prev) => [...prev, 160, 200]);
      setPods((prev) => [...prev, { id: `netflix-${Date.now()}-0`, status: 'pending', cpu: 0, label: 'api-gw-r4t5y' }]);
      setAvgCpu(62);
      setReplicaHistory((prev) => [...prev, 3]);
    }, 4000);

    scheduleTimeout(() => {
      addLog('6:45 PM - Peak starting. 2,000 req/s. Dinner-time viewing.', 'info', '18:45:00');
      addLog('HPA: Gradual increase. Scaling 3 \u2192 4', 'action', '18:45:15');
      setPods((prev) => {
        const updated = prev.map((p) => ({ ...p, status: 'running' as const, cpu: 58 }));
        return [...updated, { id: `netflix-${Date.now()}-1`, status: 'pending' as const, cpu: 0, label: 'api-gw-m7n8p' }];
      });
      setTrafficPoints((prev) => [...prev, 280, 340]);
      setAvgCpu(58);
      setReplicaHistory((prev) => [...prev, 4]);
    }, 6000);

    scheduleTimeout(() => {
      addLog('8:00 PM - PRIME TIME. New season of Stranger Things dropped!', 'warning', '20:00:00');
      addLog('Traffic: 4,500 req/s. Everyone is watching. CPU at 75%', 'warning', '20:00:05');
      addLog('HPA: Scaling 4 \u2192 6 pods for prime time load', 'action', '20:00:20');
      setPods((prev) => {
        const updated = prev.map((p) => ({ ...p, status: 'running' as const, cpu: 75 }));
        return [
          ...updated,
          { id: `netflix-${Date.now()}-2`, status: 'pending' as const, cpu: 0, label: 'api-gw-w2e3r' },
          { id: `netflix-${Date.now()}-3`, status: 'pending' as const, cpu: 0, label: 'api-gw-t5y6u' },
        ];
      });
      setTrafficPoints((prev) => [...prev, 400, 450]);
      setAvgCpu(75);
      setReplicaHistory((prev) => [...prev, 6]);
    }, 8000);

    scheduleTimeout(() => {
      addLog('9:00 PM - Peak viewership. 6 pods handling 4,500 req/s smoothly', 'success', '21:00:00');
      addLog('Netflix uses custom metric: active-streams-per-pod. Target: 750', 'info', '21:00:01');
      setPods((prev) => prev.map((p) => ({ ...p, status: 'running', cpu: 52 })));
      setAvgCpu(52);
      setTrafficPoints((prev) => [...prev, 450, 440]);
    }, 10500);

    scheduleTimeout(() => {
      addLog('11:30 PM - Viewers going to bed. Traffic dropping: 4,500 \u2192 2,000 req/s', 'info', '23:30:00');
      addLog('HPA: Scale-down stabilization window active (5 min). Waiting...', 'info', '23:30:15');
      addLog('HPA: This prevents flapping - traffic might come back briefly', 'info', '23:31:00');
      setAvgCpu(35);
      setTrafficPoints((prev) => [...prev, 300, 200]);
      setPods((prev) => prev.map((p) => ({ ...p, cpu: 35 })));
    }, 13000);

    scheduleTimeout(() => {
      addLog('11:36 PM - Stabilization window passed. Scaling 6 \u2192 4 pods (25% max scale-down)', 'action', '23:36:00');
      setPods((prev) => {
        const sorted = [...prev];
        sorted[sorted.length - 1] = { ...sorted[sorted.length - 1], status: 'terminating' };
        sorted[sorted.length - 2] = { ...sorted[sorted.length - 2], status: 'terminating' };
        return sorted;
      });
      setReplicaHistory((prev) => [...prev, 4]);
    }, 15000);

    scheduleTimeout(() => {
      addLog('Graceful shutdown complete. 4 pods remaining. System stable for the night.', 'success', '23:37:00');
      setPods((prev) => prev.filter((p) => p.status !== 'terminating'));
      setAvgCpu(28);
      setTrafficPoints((prev) => [...prev, 150]);
      setIsRunning(false);
    }, 17000);
  }, [addLog, scheduleTimeout]);

  const runUberSurge = useCallback(() => {
    setIsRunning(true);
    setActiveScenario('uber-surge');
    setLogs([]);

    addLog('2:00 PM - Sunny afternoon. Normal ride requests. 2 pods at 30% CPU', 'info', '14:00:00');
    setTrafficPoints([50, 55, 48, 52, 50]);

    scheduleTimeout(() => {
      addLog('2:15 PM - Rain starts pouring in downtown. Ride requests 3x in 2 minutes!', 'warning', '14:15:00');
      addLog('Surge pricing algorithm activated. Pricing API load: 500 \u2192 1,800 req/s', 'warning', '14:15:05');
      setTrafficPoints((prev) => [...prev, 150, 300, 500]);
      setAvgCpu(78);
      setPods((prev) => prev.map((p) => ({ ...p, cpu: 78 })));
    }, 2000);

    scheduleTimeout(() => {
      addLog('HPA: CPU 78% > target 50%. desiredReplicas = ceil(2 * (78/50)) = 4', 'action', '14:15:20');
      addLog('HPA: Adding 2 pods (Wave 1). Surge calculations need to be real-time!', 'action', '14:15:22');
      setPods((prev) => [
        ...prev.map((p) => ({ ...p, cpu: 80 })),
        { id: `uber-${Date.now()}-0`, status: 'pending' as const, cpu: 0, label: 'surge-api-j3k4' },
        { id: `uber-${Date.now()}-1`, status: 'pending' as const, cpu: 0, label: 'surge-api-l5m6' },
      ]);
      setReplicaHistory((prev) => [...prev, 4]);
    }, 4000);

    scheduleTimeout(() => {
      addLog('Wave 1 pods Running. But rain intensifies - everyone wants a ride now', 'success', '14:16:00');
      addLog('Request rate: 3,200 req/s. Airport, office district, malls all surging', 'warning', '14:16:10');
      setPods((prev) => prev.map((p) => ({ ...p, status: 'running', cpu: 72 })));
      setAvgCpu(72);
      setTrafficPoints((prev) => [...prev, 700, 900]);
    }, 6000);

    scheduleTimeout(() => {
      addLog('HPA: Still above target. Scaling 4 \u2192 7 pods (Wave 2)', 'action', '14:16:30');
      addLog('Each pod handles surge pricing for a geo-zone. More pods = more zones served', 'info', '14:16:32');
      setPods((prev) => [
        ...prev,
        { id: `uber-${Date.now()}-2`, status: 'pending' as const, cpu: 0, label: 'surge-api-n7p8' },
        { id: `uber-${Date.now()}-3`, status: 'pending' as const, cpu: 0, label: 'surge-api-q9r1' },
        { id: `uber-${Date.now()}-4`, status: 'pending' as const, cpu: 0, label: 'surge-api-s2t3' },
      ]);
      setAvgCpu(82);
      setTrafficPoints((prev) => [...prev, 1100, 1300]);
      setReplicaHistory((prev) => [...prev, 7]);
    }, 8000);

    scheduleTimeout(() => {
      addLog('All 7 pods Running. Load balanced across geo-zones', 'success', '14:17:15');
      addLog('Surge multiplier calculated per zone: Downtown 2.3x, Airport 1.8x, Suburbs 1.2x', 'info', '14:17:20');
      setPods((prev) => prev.map((p) => ({ ...p, status: 'running', cpu: 45 + Math.random() * 10 })));
      setAvgCpu(48);
      setTrafficPoints((prev) => [...prev, 1200, 1100]);
    }, 10500);

    scheduleTimeout(() => {
      addLog('3:00 PM - Rain stops. Ride requests normalizing over 15 minutes', 'info', '15:00:00');
      addLog('HPA: CPU at 30%. Scale-down stabilization window starts (5 min timer)', 'info', '15:00:15');
      addLog('This delay prevents scaling down if another rain burst comes', 'info', '15:01:00');
      setAvgCpu(30);
      setPods((prev) => prev.map((p) => ({ ...p, cpu: 30 })));
      setTrafficPoints((prev) => [...prev, 600, 300, 200]);
    }, 13000);

    scheduleTimeout(() => {
      addLog('3:06 PM - Stabilization passed. Scaling 7 \u2192 4 \u2192 2 over next 10 minutes', 'action', '15:06:00');
      addLog('Graceful termination: each pod finishes in-flight pricing calculations first', 'info', '15:06:05');
      setPods((prev) => prev.slice(0, 4).map((p) => ({ ...p, cpu: 25 })));
      setReplicaHistory((prev) => [...prev, 4, 2]);
      setIsRunning(false);
    }, 15500);
  }, [addLog, scheduleTimeout]);

  const handleScenarioSelect = useCallback((id: string) => {
    reset();
    setTimeout(() => {
      if (id === 'hotstar-ipl') runHotstarIPL();
      else if (id === 'netflix-evening') runNetflixEvening();
      else if (id === 'uber-surge') runUberSurge();
    }, 100);
  }, [reset, runHotstarIPL, runNetflixEvening, runUberSurge]);

  const handleModeChange = useCallback((newMode: 'stories' | 'simulator') => {
    if (newMode === 'stories') {
      sim.pause();
      sim.reset();
    } else {
      reset();
    }
    setMode(newMode);
  }, [reset, sim]);

  // ── Render ──

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">Horizontal Pod Autoscaler</h3>
          <p className="text-xs text-zinc-300 sm:text-sm">Scales pod replicas based on CPU, memory, or custom metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle mode={mode} onChange={handleModeChange} />
          {mode === 'stories' && isRunning && (
            <button
              onClick={reset}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:text-white sm:px-4 sm:py-2 sm:text-sm"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {mode === 'stories' ? (
        <>
          <ScenarioSelector
            scenarios={scenarios}
            activeScenario={activeScenario}
            onSelect={handleScenarioSelect}
            disabled={isRunning}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricsGauge value={avgCpu} threshold={60} label="Average CPU Utilization" />
            <TrafficGraph points={trafficPoints} maxValue={4000} label="Incoming Traffic" />
          </div>

          <ScalingScene
            isFlowing={isRunning || pods.some((p) => p.status === 'running')}
            trafficIntensity={Math.min(Math.ceil(avgCpu / 25), 5)}
            deploymentName="web-api"
            podCount={pods.filter((p) => p.status === 'running').length}
            totalCount={pods.length}
          >
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {pods.map((pod, i) => (
                  <motion.div
                    key={pod.id}
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: -10 }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 260, damping: 20 }}
                    layout
                    className="flex flex-col items-center gap-0.5"
                  >
                    <PodIcon status={pod.status} cpu={Math.round(pod.cpu)} size={36} />
                    {pod.label && (
                      <span className="max-w-[40px] truncate text-[7px] text-zinc-400">{pod.label}</span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-2 text-[9px] text-zinc-400">
              min: 2 | max: 10 | target CPU: 60%
            </div>
          </ScalingScene>

          <NarrationLog entries={logs} />
        </>
      ) : (
        <>
          {/* Simulator Mode */}
          <ConfigPanel
            type="hpa"
            config={simConfig}
            onChange={(c) => setSimConfig(c as HPAConfig)}
            disabled={sim.isRunning}
          />

          <SmartHints hints={hints} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TimelineControls
              isRunning={sim.isRunning}
              onPlay={sim.start}
              onPause={sim.pause}
              onReset={sim.reset}
              speed={sim.speed}
              onSpeedChange={sim.changeSpeed}
              tick={sim.state.tick}
            />
            <EventTriggerBar
              events={hpaEvents}
              onTrigger={sim.triggerEvent}
              disabled={!sim.isRunning}
            />
          </div>

          <LiveMetricsBar metrics={sim.state.metrics} />

          <ScalingScene
            isFlowing={sim.isRunning && sim.state.pods.some((p) => p.status === 'running')}
            trafficIntensity={Math.min(Math.ceil(sim.state.avgCpu / 25), 5)}
            deploymentName="web-api"
            podCount={sim.state.pods.filter((p) => p.status === 'running').length}
            totalCount={sim.state.pods.length}
          >
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {sim.state.pods.map((pod, i) => (
                  <motion.div
                    key={pod.id}
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: -10 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                    layout
                    className="flex flex-col items-center gap-0.5"
                  >
                    <PodIcon status={pod.status} cpu={Math.round(pod.cpu)} size={36} />
                    <span className="max-w-[40px] truncate text-[7px] text-zinc-400">{pod.label}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-2 text-[9px] text-zinc-400">
              min: {simConfig.minPods} | max: {simConfig.maxPods} | target CPU: {simConfig.cpuTarget}%
            </div>
          </ScalingScene>

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricsGauge value={sim.state.avgCpu} threshold={simConfig.cpuTarget} label="Average CPU Utilization" />
            <TrafficGraph points={sim.state.trafficHistory} maxValue={300} label="Traffic Load" />
          </div>

          <NarrationLog entries={sim.state.logs} />
          <SimulatorGuide active={mode === 'simulator'} />
        </>
      )}
    </div>
  );
}
