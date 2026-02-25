'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PodIcon from './PodIcon';
import NarrationLog, { type LogEntry } from './NarrationLog';
import ScenarioSelector, { type Scenario } from './ScenarioSelector';
import ScalingScene from './ScalingScene';
import ModeToggle from './ModeToggle';
import ConfigPanel from './simulator/ConfigPanel';
import EventTriggerBar from './simulator/EventTriggerBar';
import TimelineControls from './simulator/TimelineControls';
import LiveMetricsBar from './simulator/LiveMetricsBar';
import SmartHints from './simulator/SmartHints';
import SimulatorGuide from './simulator/SimulatorGuide';
import { useSimulation } from '@/lib/simulator/useSimulation';
import { getClusterHints } from '@/lib/simulator/hintEngine';
import type { ClusterConfig, EventDef } from '@/lib/simulator/types';

interface Node {
  id: string;
  label: string;
  type: string;
  pods: { id: string; status: 'running' | 'pending' }[];
  status: 'ready' | 'provisioning' | 'draining' | 'terminated';
}

const scenarios: Scenario[] = [
  {
    id: 'flipkart-sale',
    name: 'Big Billion Days Sale',
    description: 'Flipkart scales from 20 to 120 nodes for their annual sale. HPA creates 800+ pods that overflow existing nodes. CA provisions c5.4xlarge instances.',
    company: 'Flipkart (pattern)',
    icon: (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2h12v10H2zM5 12v2M11 12v2M1 14h14" /></svg>),
  },
  {
    id: 'spotify-morning',
    name: 'Morning Commute Ramp',
    description: 'Spotify adds 15 nodes each weekday morning 7-9 AM as commuters start streaming. Predictable pattern, CA + HPA work together.',
    company: 'Spotify (pattern)',
    icon: (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M4 6c2 1 6 1 8 0M3.5 9c2.5 1 6.5 1 9 0" /></svg>),
  },
  {
    id: 'github-actions',
    name: 'CI/CD Pipeline Burst',
    description: 'GitHub-style CI runners need 50 nodes for 30 minutes during a monorepo merge, then scale back to 5. Burst then drain pattern.',
    company: 'GitHub (pattern)',
    icon: (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" /></svg>),
  },
];

const clusterEvents: EventDef[] = [
  { type: 'traffic_spike_2x', label: 'Spike 2x', icon: '\uD83D\uDD25', description: 'Double traffic (needs more pods/nodes)' },
  { type: 'traffic_spike_5x', label: 'Spike 5x', icon: '\uD83D\uDD25', description: '5x traffic burst' },
  { type: 'pod_crash', label: 'Crash Pod', icon: '\uD83D\uDC80', description: 'Kill a pod' },
  { type: 'cool_down', label: 'Cool Down', icon: '\uD83E\uDDCA', description: 'Return to baseline' },
];

let logCounter = 0;
function createLog(message: string, type: LogEntry['type'], time: string): LogEntry {
  return { id: `ca-log-${++logCounter}`, timestamp: time, message, type };
}

const defaultClusterConfig: ClusterConfig = {
  minNodes: 2,
  maxNodes: 5,
  podsPerNode: 8,
  scaleDownThreshold: 50,
  provisioningTime: 3,
};

export default function ClusterVisualization() {
  const [mode, setMode] = useState<'stories' | 'simulator'>('stories');

  // ── Simulator ──
  const [simConfig, setSimConfig] = useState<ClusterConfig>(defaultClusterConfig);
  const sim = useSimulation('cluster', simConfig);
  const hints = useMemo(() => getClusterHints(simConfig), [simConfig]);

  // ── Story state ──
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'node-1', label: 'worker-1', type: 'c5.2xlarge', status: 'ready', pods: [{ id: 'p1', status: 'running' }, { id: 'p2', status: 'running' }, { id: 'p3', status: 'running' }] },
    { id: 'node-2', label: 'worker-2', type: 'c5.2xlarge', status: 'ready', pods: [{ id: 'p4', status: 'running' }, { id: 'p5', status: 'running' }] },
  ]);
  const [pendingPods, setPendingPods] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
    setNodes([
      { id: 'node-1', label: 'worker-1', type: 'c5.2xlarge', status: 'ready', pods: [{ id: 'p1', status: 'running' }, { id: 'p2', status: 'running' }, { id: 'p3', status: 'running' }] },
      { id: 'node-2', label: 'worker-2', type: 'c5.2xlarge', status: 'ready', pods: [{ id: 'p4', status: 'running' }, { id: 'p5', status: 'running' }] },
    ]);
    setPendingPods([]); setLogs([]); setIsRunning(false); setActiveScenario(null);
  }, []);

  // ── Stories (unchanged - same as before) ──

  const runFlipkartSale = useCallback(() => {
    setIsRunning(true); setActiveScenario('flipkart-sale'); setLogs([]);
    addLog('Sale goes live in T-5 minutes. Current cluster: 2 nodes, 5 pods', 'info', '00:00:00');
    schedule(() => { addLog('SALE IS LIVE! HPA scales web-frontend: 5 \u2192 15 pods instantly', 'warning', '00:00:05'); addLog('10 new pods created but only 3 fit on existing nodes...', 'warning', '00:00:08'); setPendingPods(['sale-1','sale-2','sale-3','sale-4','sale-5','sale-6','sale-7']); setNodes((prev) => prev.map((n) => ({ ...n, pods: [...n.pods, { id: `extra-${n.id}`, status: 'running' }] }))); }, 2500);
    schedule(() => { addLog('7 pods PENDING: "0/2 nodes are available: insufficient cpu"', 'error', '00:00:12'); addLog('Cluster Autoscaler: Detected 7 unschedulable pods', 'action', '00:00:15'); addLog('CA: Need 2 nodes for 7 pods.', 'action', '00:00:17'); }, 4500);
    schedule(() => { addLog('CA: Calling AWS EC2 API \u2192 Requesting 2x c5.2xlarge instances', 'action', '00:00:20'); setNodes((prev) => [...prev, { id: `node-${Date.now()}-1`, label: 'worker-3', type: 'c5.2xlarge', status: 'provisioning', pods: [] }, { id: `node-${Date.now()}-2`, label: 'worker-4', type: 'c5.2xlarge', status: 'provisioning', pods: [] }]); }, 6500);
    schedule(() => { addLog('Node worker-3: kubelet registered \u2192 node Ready!', 'success', '00:01:45'); setNodes((prev) => prev.map((n) => n.label === 'worker-3' ? { ...n, status: 'ready' } : n)); }, 9000);
    schedule(() => { addLog('Node worker-4: Ready! Scheduler placing pending pods...', 'success', '00:02:00'); setNodes((prev) => prev.map((n) => n.label === 'worker-4' ? { ...n, status: 'ready' } : n)); setPendingPods((prev) => prev.slice(0, 3)); }, 10500);
    schedule(() => { addLog('4 pods scheduled on worker-3, 3 on worker-4', 'success', '00:02:10'); setPendingPods([]); setNodes((prev) => prev.map((n) => { if (n.label === 'worker-3') return { ...n, pods: [{ id: 's1', status: 'running' }, { id: 's2', status: 'running' }, { id: 's3', status: 'running' }, { id: 's4', status: 'running' }] }; if (n.label === 'worker-4') return { ...n, pods: [{ id: 's5', status: 'running' }, { id: 's6', status: 'running' }, { id: 's7', status: 'running' }] }; return n; })); }, 12500);
    schedule(() => { addLog('All pods Running. 4 nodes, 15 pods. Sale traffic served.', 'success', '00:02:30'); addLog('Total scale-up time: ~2 minutes (EC2 provisioning is the bottleneck)', 'info', '00:02:35'); setIsRunning(false); }, 14500);
  }, [addLog, schedule]);

  const runSpotifyMorning = useCallback(() => {
    setIsRunning(true); setActiveScenario('spotify-morning'); setLogs([]);
    addLog('5:00 AM - Overnight low. 2 nodes running recommendation engine', 'info', '05:00');
    schedule(() => { addLog('6:30 AM - Early commuters. HPA: 5 \u2192 8 pods. Still fits on 2 nodes.', 'info', '06:30'); setNodes((prev) => prev.map((n, i) => ({ ...n, pods: i === 0 ? [...n.pods, { id: 'am1', status: 'running' }] : [...n.pods, { id: 'am2', status: 'running' }, { id: 'am3', status: 'running' }] }))); }, 3000);
    schedule(() => { addLog('7:15 AM - Rush hour! HPA: 8 \u2192 14 pods. 6 pods cannot fit!', 'warning', '07:15'); setPendingPods(['rush-1','rush-2','rush-3','rush-4','rush-5','rush-6']); }, 5500);
    schedule(() => { addLog('CA: 6 pods pending. Requesting 2 new nodes.', 'action', '07:16'); setNodes((prev) => [...prev, { id: `spot-${Date.now()}-1`, label: 'worker-3', type: 't3.xlarge', status: 'provisioning', pods: [] }, { id: `spot-${Date.now()}-2`, label: 'worker-4', type: 't3.xlarge', status: 'provisioning', pods: [] }]); }, 7500);
    schedule(() => { addLog('Nodes ready. Pods scheduled. 4 nodes handling morning rush.', 'success', '07:19'); setPendingPods([]); setNodes((prev) => prev.map((n) => { if (n.label === 'worker-3') return { ...n, status: 'ready', pods: [{ id: 'r1', status: 'running' }, { id: 'r2', status: 'running' }, { id: 'r3', status: 'running' }] }; if (n.label === 'worker-4') return { ...n, status: 'ready', pods: [{ id: 'r4', status: 'running' }, { id: 'r5', status: 'running' }, { id: 'r6', status: 'running' }] }; return n; })); }, 10000);
    schedule(() => { addLog('10:00 AM - Morning rush over. CA: worker-3 & worker-4 underutilized.', 'info', '10:00'); }, 12500);
    schedule(() => { addLog('10:11 AM - Timer passed. CA cordoning & draining nodes.', 'action', '10:11'); setNodes((prev) => prev.map((n) => n.label === 'worker-3' || n.label === 'worker-4' ? { ...n, status: 'draining', pods: [] } : n)); }, 15000);
    schedule(() => { addLog('10:13 AM - Nodes terminated. Back to 2 nodes. Cost optimized.', 'success', '10:13'); setNodes((prev) => prev.filter((n) => n.label === 'worker-1' || n.label === 'worker-2')); setIsRunning(false); }, 17500);
  }, [addLog, schedule]);

  const runGithubCI = useCallback(() => {
    setIsRunning(true); setActiveScenario('github-actions'); setLogs([]);
    addLog('Monorepo merge to main. CI pipeline triggers 200 test jobs.', 'info', '14:00:00');
    schedule(() => { addLog('KEDA scales CI runner: 0 \u2192 40 pods. 32 pods PENDING!', 'error', '14:00:15'); setPendingPods(Array.from({ length: 8 }, (_, i) => `ci-${i}`)); }, 2500);
    schedule(() => { addLog('CA: Massive burst. Requesting 4 nodes simultaneously.', 'action', '14:00:20'); const newNodes: Node[] = Array.from({ length: 4 }, (_, i) => ({ id: `ci-node-${Date.now()}-${i}`, label: `ci-runner-${i + 1}`, type: 'c5.4xlarge', status: 'provisioning' as const, pods: [] })); setNodes((prev) => [...prev, ...newNodes]); }, 5000);
    schedule(() => { addLog('Nodes coming online...', 'info', '14:01:30'); setNodes((prev) => prev.map((n, i) => n.status === 'provisioning' && i === 2 ? { ...n, status: 'ready', pods: [{ id: 'ci-a1', status: 'running' }, { id: 'ci-a2', status: 'running' }] } : n)); setPendingPods((prev) => prev.slice(0, 6)); }, 7500);
    schedule(() => { addLog('All 6 nodes ready. 40 CI pods running in parallel.', 'success', '14:02:30'); setPendingPods([]); setNodes((prev) => prev.map((n) => ({ ...n, status: 'ready', pods: n.pods.length === 0 ? Array.from({ length: 6 }, (_, i) => ({ id: `${n.id}-p${i}`, status: 'running' as const })) : n.pods }))); }, 10000);
    schedule(() => { addLog('14:25 - All 200 tests complete. CI pods terminating.', 'info', '14:25:00'); setNodes((prev) => prev.map((n) => n.label?.startsWith('ci-runner') ? { ...n, pods: [] } : n)); }, 13000);
    schedule(() => { addLog('14:35 - CA terminating 4 CI nodes. Cost: ~$2.40 for 30 min burst.', 'success', '14:35:00'); setNodes((prev) => prev.filter((n) => !n.label?.startsWith('ci-runner'))); setIsRunning(false); }, 16000);
  }, [addLog, schedule]);

  const handleScenarioSelect = useCallback((id: string) => {
    reset();
    setTimeout(() => {
      if (id === 'flipkart-sale') runFlipkartSale();
      else if (id === 'spotify-morning') runSpotifyMorning();
      else if (id === 'github-actions') runGithubCI();
    }, 100);
  }, [reset, runFlipkartSale, runSpotifyMorning, runGithubCI]);

  const handleModeChange = useCallback((newMode: 'stories' | 'simulator') => {
    if (newMode === 'stories') { sim.pause(); sim.reset(); } else { reset(); }
    setMode(newMode);
  }, [reset, sim]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">Cluster Autoscaler</h3>
          <p className="text-xs text-zinc-300 sm:text-sm">Adds/removes cloud VM nodes when pods can&apos;t be scheduled</p>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle mode={mode} onChange={handleModeChange} />
          {mode === 'stories' && isRunning && (
            <button onClick={reset} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:text-white sm:px-4 sm:py-2 sm:text-sm">Reset</button>
          )}
        </div>
      </div>

      {mode === 'stories' ? (
        <>
          <ScenarioSelector scenarios={scenarios} activeScenario={activeScenario} onSelect={handleScenarioSelect} disabled={isRunning} />

          <ScalingScene
            isFlowing={isRunning || nodes.some((n) => n.status === 'ready' && n.pods.length > 0)}
            trafficIntensity={Math.min(nodes.reduce((sum, n) => sum + n.pods.length, 0), 5)}
            deploymentName="cluster"
            podCount={nodes.reduce((sum, n) => n.status === 'ready' ? sum + n.pods.length : sum, 0)}
            totalCount={nodes.reduce((sum, n) => sum + n.pods.length, 0) + pendingPods.length}
          >
            <div className="space-y-2">
              <AnimatePresence>
                {pendingPods.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="rounded-lg border border-red-500/30 bg-red-500/5 p-2">
                    <div className="mb-1.5 flex items-center justify-between text-[9px]">
                      <span className="font-medium text-red-400">Pending</span>
                      <span className="text-red-400/60">{pendingPods.length} unschedulable</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pendingPods.map((id) => (
                        <motion.div key={id} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex h-5 w-5 items-center justify-center rounded border border-dashed border-red-500/50 text-red-400">
                          <svg width="8" height="8" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" /></svg>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {nodes.map((node) => (
                  <motion.div key={node.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.95 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className={`rounded-lg border p-2.5 ${node.status === 'provisioning' ? 'border-yellow-500/30 bg-yellow-500/5' : node.status === 'draining' ? 'border-red-500/30 bg-red-500/5' : 'border-zinc-600/40 bg-zinc-700/30'}`}>
                    <div className="mb-1.5 flex items-center justify-between text-[9px]">
                      <div className="flex items-center gap-1.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="3" /><path d="M2 8h20M8 2v20" /></svg>
                        <span className="font-medium text-zinc-200">{node.label}</span>
                        <span className="text-zinc-400">{node.type}</span>
                      </div>
                      <span className={`font-medium ${node.status === 'ready' ? 'text-green-400' : node.status === 'provisioning' ? 'text-yellow-400' : node.status === 'draining' ? 'text-red-400' : 'text-zinc-400'}`}>
                        {node.status === 'ready' && `${node.pods.length} pods`}
                        {node.status === 'provisioning' && 'Booting...'}
                        {node.status === 'draining' && 'Draining'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {node.status === 'provisioning' ? (
                        <motion.span animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="text-[8px] text-yellow-500">EC2 booting...</motion.span>
                      ) : (
                        <AnimatePresence>
                          {node.pods.map((pod) => (
                            <motion.div key={pod.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ type: 'spring', stiffness: 300 }} className="flex h-5 w-5 items-center justify-center rounded bg-brand-500/10 text-brand-400">
                              <svg width="8" height="8" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" /></svg>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScalingScene>

          <NarrationLog entries={logs} />
        </>
      ) : (
        <>
          <ConfigPanel type="cluster" config={simConfig} onChange={(c) => setSimConfig(c as ClusterConfig)} disabled={sim.isRunning} />
          <SmartHints hints={hints} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TimelineControls isRunning={sim.isRunning} onPlay={sim.start} onPause={sim.pause} onReset={sim.reset} speed={sim.speed} onSpeedChange={sim.changeSpeed} tick={sim.state.tick} />
            <EventTriggerBar events={clusterEvents} onTrigger={sim.triggerEvent} disabled={!sim.isRunning} />
          </div>

          <LiveMetricsBar metrics={sim.state.metrics} />

          <ScalingScene
            isFlowing={sim.isRunning && sim.state.pods.some((p) => p.status === 'running')}
            trafficIntensity={Math.min(Math.ceil(sim.state.avgCpu / 25), 5)}
            deploymentName="cluster"
            podCount={sim.state.pods.filter((p) => p.status === 'running').length}
            totalCount={sim.state.pods.length}
          >
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {sim.state.pods.map((pod, i) => (
                  <motion.div key={pod.id} initial={{ opacity: 0, scale: 0, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 20 }} layout className="flex flex-col items-center gap-0.5">
                    <PodIcon status={pod.status} cpu={Math.round(pod.cpu)} size={32} />
                    <span className="max-w-[40px] truncate text-[7px] text-zinc-400">{pod.label}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScalingScene>

          <NarrationLog entries={sim.state.logs} />
          <SimulatorGuide active={mode === 'simulator'} />
        </>
      )}
    </div>
  );
}
