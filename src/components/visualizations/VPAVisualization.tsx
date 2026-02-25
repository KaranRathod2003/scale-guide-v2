'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import MetricsGauge from './MetricsGauge';
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
import { getVPAHints } from '@/lib/simulator/hintEngine';
import type { VPAConfig, EventDef } from '@/lib/simulator/types';

const scenarios: Scenario[] = [
  {
    id: 'shopify-db',
    name: 'Database Night Batch',
    description: 'Shopify runs nightly analytics on PostgreSQL. Day: 500m CPU, 1Gi RAM. Night batch: needs 4 CPU, 8Gi RAM. VPA auto-adjusts.',
    company: 'Shopify (pattern)',
    icon: (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="2" width="10" height="12" rx="1" /><path d="M6 6h4M6 9h4" /></svg>),
  },
  {
    id: 'redis-memory',
    name: 'Redis Cache Growing',
    description: 'A Redis cache pod slowly accumulates data over weeks. Started with 256Mi, now needs 2Gi. VPA detects the trend and right-sizes.',
    company: 'Generic Pattern',
    icon: (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12l4-4 3 3 5-7" /><path d="M11 4h3v3" /></svg>),
  },
  {
    id: 'java-oom',
    name: 'Java App OOM Recovery',
    description: 'A Java Spring Boot app gets OOM-killed under load. VPA detects repeated OOM events and bumps memory requests to prevent crashes.',
    company: 'Common Issue',
    icon: (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v6M8 11v1" /><circle cx="8" cy="8" r="6" /></svg>),
  },
];

const vpaEvents: EventDef[] = [
  { type: 'traffic_spike_2x', label: 'Load 2x', icon: '\uD83D\uDD25', description: 'Double resource usage' },
  { type: 'traffic_spike_5x', label: 'Load 5x', icon: '\uD83D\uDD25', description: '5x resource usage' },
  { type: 'cool_down', label: 'Cool Down', icon: '\uD83E\uDDCA', description: 'Return to baseline' },
];

let logCounter = 0;
function createLog(message: string, type: LogEntry['type'], time: string): LogEntry {
  return { id: `vpa-log-${++logCounter}`, timestamp: time, message, type };
}

const defaultVPAConfig: VPAConfig = {
  initialCpuMillis: 500,
  initialMemoryMi: 512,
  maxCpuMillis: 4000,
  maxMemoryMi: 8192,
  updateMode: 'Auto',
};

export default function VPAVisualization() {
  const [mode, setMode] = useState<'stories' | 'simulator'>('stories');

  // ── Simulator ──
  const [simConfig, setSimConfig] = useState<VPAConfig>(defaultVPAConfig);
  const sim = useSimulation('vpa', simConfig);
  const hints = useMemo(() => getVPAHints(simConfig), [simConfig]);

  // ── Story state ──
  const [cpuRequest, setCpuRequest] = useState(500);
  const [memoryRequest, setMemoryRequest] = useState(512);
  const [cpuUsage, setCpuUsage] = useState(35);
  const [memoryUsage, setMemoryUsage] = useState(40);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [podStatus, setPodStatus] = useState<'running' | 'evicting' | 'recreating' | 'optimized'>('running');
  const [recommendation, setRecommendation] = useState<{ cpu: string; mem: string } | null>(null);
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
    setCpuRequest(500); setMemoryRequest(512); setCpuUsage(35); setMemoryUsage(40);
    setLogs([]); setIsRunning(false); setActiveScenario(null);
    setPodStatus('running'); setRecommendation(null);
  }, []);

  // ── Stories (unchanged) ──

  const runShopifyDB = useCallback(() => {
    setIsRunning(true); setActiveScenario('shopify-db'); setLogs([]);
    addLog('10:00 AM - PostgreSQL pod running OLTP queries. CPU: 35%, Memory: 40%', 'info', '10:00:00');
    addLog('Current requests: cpu=500m, memory=512Mi. Pod is comfortable.', 'info', '10:00:01');
    schedule(() => { addLog('VPA Recommender observing usage... 24h histogram building', 'info', '10:15:00'); addLog('Day usage P95: cpu=420m, memory=480Mi. Requests look well-sized.', 'info', '10:15:01'); }, 2500);
    schedule(() => { addLog('11:00 PM - Night batch ETL job starts. Heavy aggregation queries.', 'warning', '23:00:00'); setCpuUsage(72); setMemoryUsage(65); }, 4500);
    schedule(() => { addLog('CPU usage jumps: 35% \u2192 72%. Memory: 40% \u2192 65%. Batch crunching data.', 'warning', '23:05:00'); setCpuUsage(88); setMemoryUsage(78); }, 6000);
    schedule(() => { addLog('CPU at 88%, Memory at 78%. Pod is throttled. Batch queries slowing down.', 'error', '23:15:00'); addLog('VPA Recommender: "Usage exceeds requests. Updating recommendation..."', 'action', '23:15:30'); setRecommendation({ cpu: '2000m', mem: '2048Mi' }); setCpuUsage(92); setMemoryUsage(82); }, 8000);
    schedule(() => { addLog('VPA Recommendation updated:', 'action', '23:16:00'); addLog('  Target: cpu=2000m, memory=2048Mi', 'success', '23:16:02'); }, 10000);
    schedule(() => { addLog('VPA Updater: Current requests too far from target. Evicting pod...', 'action', '23:17:00'); setPodStatus('evicting'); setCpuUsage(0); setMemoryUsage(0); }, 12000);
    schedule(() => { addLog('VPA Admission Controller: Injecting new resource requests into pod spec', 'action', '23:17:30'); addLog('  cpu: 500m \u2192 2000m (+300%)', 'success', '23:17:31'); addLog('  memory: 512Mi \u2192 2048Mi (+300%)', 'success', '23:17:32'); setPodStatus('recreating'); setCpuRequest(2000); setMemoryRequest(2048); }, 14000);
    schedule(() => { addLog('Pod postgres-0 recreated with new resources. Starting up...', 'info', '23:18:00'); setPodStatus('running'); setCpuUsage(45); setMemoryUsage(38); }, 16000);
    schedule(() => { addLog('Batch job resuming. CPU at 45% (of 2000m), Memory at 38% (of 2048Mi)', 'success', '23:18:30'); addLog('Queries running 3x faster with more CPU allocated.', 'success', '23:19:00'); setPodStatus('optimized'); setIsRunning(false); }, 18000);
  }, [addLog, schedule]);

  const runRedisMemory = useCallback(() => {
    setIsRunning(true); setActiveScenario('redis-memory'); setLogs([]);
    setCpuRequest(250); setMemoryRequest(256);
    addLog('Week 1 - Redis cache deployed. memory=256Mi. Usage: 30%', 'info', 'Week 1');
    schedule(() => { addLog('Week 2 - Cache filling with user sessions. Memory usage: 45%', 'info', 'Week 2'); setMemoryUsage(45); }, 2000);
    schedule(() => { addLog('Week 3 - Product catalog cached. Memory: 62%', 'info', 'Week 3'); setMemoryUsage(62); }, 4000);
    schedule(() => { addLog('Week 4 - Memory: 78%. VPA Recommender notices upward trend.', 'warning', 'Week 4'); setMemoryUsage(78); setRecommendation({ cpu: '250m', mem: '1024Mi' }); }, 6000);
    schedule(() => { addLog('Week 5 - Memory: 88%. Approaching limit!', 'error', 'Week 5'); addLog('VPA: Recommendation target = 1024Mi. Evicting to right-size.', 'action', 'Week 5'); setMemoryUsage(88); setPodStatus('evicting'); }, 8000);
    schedule(() => { addLog('Pod recreated with memory: 256Mi \u2192 1024Mi', 'success', 'Week 5'); setPodStatus('recreating'); setMemoryRequest(1024); }, 10000);
    schedule(() => { addLog('Redis pod running with 1024Mi. Memory usage now: 42%', 'success', 'Week 5'); addLog('Plenty of headroom. Cache can grow without OOM risk.', 'info', 'Week 5'); setPodStatus('optimized'); setMemoryUsage(42); setIsRunning(false); }, 12000);
  }, [addLog, schedule]);

  const runJavaOOM = useCallback(() => {
    setIsRunning(true); setActiveScenario('java-oom'); setLogs([]);
    setCpuRequest(500); setMemoryRequest(512);
    addLog('Spring Boot app deployed. memory=512Mi. JVM heap = 384Mi.', 'info', '09:00:00'); setMemoryUsage(55);
    schedule(() => { addLog('Load test starts. 200 concurrent users hitting /api/reports', 'info', '09:15:00'); setMemoryUsage(72); setCpuUsage(60); }, 2500);
    schedule(() => { addLog('Memory climbing: 72% \u2192 85%. JVM garbage collection getting frequent.', 'warning', '09:18:00'); setMemoryUsage(85); }, 4500);
    schedule(() => { addLog('MEMORY: 95%. GC overhead limit exceeded!', 'error', '09:20:00'); setMemoryUsage(95); }, 6500);
    schedule(() => { addLog('OOM KILLED! Pod spring-app-7d4f8 terminated (exit code 137)', 'error', '09:20:30'); setPodStatus('evicting'); setMemoryUsage(0); setCpuUsage(0); }, 8500);
    schedule(() => { addLog('VPA detects OOM event. Immediately bumps memory recommendation.', 'action', '09:21:00'); setRecommendation({ cpu: '500m', mem: '1536Mi' }); }, 10500);
    schedule(() => { addLog('VPA Admission Controller: Next pod creation gets 1536Mi memory', 'action', '09:21:30'); setPodStatus('recreating'); setMemoryRequest(1536); }, 12500);
    schedule(() => { addLog('Pod recreated with memory=1536Mi. JVM heap increased to 1152Mi.', 'success', '09:22:00'); setPodStatus('running'); setMemoryUsage(48); setCpuUsage(55); }, 14500);
    schedule(() => { addLog('Same load test: 200 users. Memory at 48%. No GC pressure!', 'success', '09:25:00'); setPodStatus('optimized'); setIsRunning(false); }, 16500);
  }, [addLog, schedule]);

  const handleScenarioSelect = useCallback((id: string) => {
    reset();
    setTimeout(() => {
      if (id === 'shopify-db') runShopifyDB();
      else if (id === 'redis-memory') runRedisMemory();
      else if (id === 'java-oom') runJavaOOM();
    }, 100);
  }, [reset, runShopifyDB, runRedisMemory, runJavaOOM]);

  const handleModeChange = useCallback((newMode: 'stories' | 'simulator') => {
    if (newMode === 'stories') { sim.pause(); sim.reset(); } else { reset(); }
    setMode(newMode);
  }, [reset, sim]);

  const podWidth = 140 + (cpuRequest / 4000) * 160;
  const podHeight = 120 + (memoryRequest / 4096) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">Vertical Pod Autoscaler</h3>
          <p className="text-xs text-zinc-300 sm:text-sm">Right-sizes CPU/memory requests. Makes pods bigger, not more.</p>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricsGauge value={cpuUsage} threshold={80} label="CPU Usage" />
            <MetricsGauge value={memoryUsage} threshold={80} label="Memory Usage" />
          </div>

          <ScalingScene
            isFlowing={podStatus === 'running' || podStatus === 'optimized'}
            trafficIntensity={Math.ceil(cpuUsage / 25)}
            deploymentName={activeScenario === 'shopify-db' ? 'postgres' : activeScenario === 'redis-memory' ? 'redis-cache' : 'spring-app'}
            podCount={podStatus === 'evicting' ? 0 : 1}
            totalCount={1}
          >
            <div>
              <div className="mb-2 text-right">
                <span className={`text-[10px] font-medium ${podStatus === 'evicting' ? 'text-red-400' : podStatus === 'recreating' ? 'text-yellow-400' : podStatus === 'optimized' ? 'text-green-400' : 'text-zinc-300'}`}>
                  {podStatus === 'running' && 'Running'}
                  {podStatus === 'evicting' && 'Evicting...'}
                  {podStatus === 'recreating' && 'Recreating...'}
                  {podStatus === 'optimized' && 'Optimized'}
                </span>
              </div>
              <div className="flex items-center justify-center">
                {podStatus === 'evicting' ? (
                  <motion.div animate={{ opacity: [1, 0.3, 1], scale: [1, 0.95, 1] }} transition={{ duration: 1, repeat: Infinity }} className="flex h-20 w-28 flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-500/50 bg-red-500/5">
                    <span className="text-[10px] text-red-400">Evicting...</span>
                    <span className="text-[8px] text-red-400/60">Draining</span>
                  </motion.div>
                ) : podStatus === 'recreating' ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} style={{ width: Math.min(podWidth, 180), height: Math.min(podHeight, 110) }} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-yellow-500/50 bg-yellow-500/5">
                    <span className="text-[10px] text-yellow-400">Recreating...</span>
                    <span className="mt-0.5 text-[8px] text-yellow-400/60">New resources</span>
                  </motion.div>
                ) : (
                  <motion.div animate={{ width: Math.min(podWidth, 180), height: Math.min(podHeight, 110) }} transition={{ type: 'spring', stiffness: 180, damping: 20 }} className={`relative flex flex-col items-center justify-center rounded-xl border-2 ${podStatus === 'optimized' ? 'border-green-500' : 'border-brand-400'} bg-brand-500/5`}>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="mb-0.5 flex justify-between text-[8px] text-zinc-400"><span>CPU: {cpuRequest}m</span><span>{Math.round(cpuUsage)}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-600/40"><motion.div animate={{ width: `${cpuUsage}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-brand-400" /></div>
                    </div>
                    <div className="absolute left-2 right-2 top-2">
                      <div className="mb-0.5 flex justify-between text-[8px] text-zinc-400"><span>Mem: {memoryRequest}Mi</span><span>{Math.round(memoryUsage)}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-600/40"><motion.div animate={{ width: `${memoryUsage}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-blue-400" /></div>
                    </div>
                    <span className="text-[9px] font-medium text-zinc-400">{activeScenario === 'shopify-db' ? 'postgres-0' : activeScenario === 'redis-memory' ? 'redis-cache-0' : 'spring-app-0'}</span>
                  </motion.div>
                )}
              </div>
              {recommendation && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-lg border border-brand-400/30 bg-brand-500/5 p-2 text-[10px]">
                  <span className="font-medium text-brand-400">VPA:</span>
                  <span className="ml-1 text-zinc-200">cpu={recommendation.cpu}, mem={recommendation.mem}</span>
                </motion.div>
              )}
            </div>
          </ScalingScene>

          <NarrationLog entries={logs} />
        </>
      ) : (
        <>
          <ConfigPanel type="vpa" config={simConfig} onChange={(c) => setSimConfig(c as VPAConfig)} disabled={sim.isRunning} />
          <SmartHints hints={hints} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TimelineControls isRunning={sim.isRunning} onPlay={sim.start} onPause={sim.pause} onReset={sim.reset} speed={sim.speed} onSpeedChange={sim.changeSpeed} tick={sim.state.tick} />
            <EventTriggerBar events={vpaEvents} onTrigger={sim.triggerEvent} disabled={!sim.isRunning} />
          </div>

          <LiveMetricsBar metrics={sim.state.metrics} />

          <ScalingScene
            isFlowing={sim.isRunning}
            trafficIntensity={Math.ceil(sim.state.avgCpu / 25)}
            deploymentName="app"
            podCount={sim.state.pods.filter((p) => p.status === 'running').length}
            totalCount={sim.state.pods.length}
          >
            <div className="flex flex-wrap gap-2">
              {sim.state.pods.map((pod) => (
                <div key={pod.id} className="relative flex flex-col items-center justify-center rounded-xl border-2 border-brand-400 bg-brand-500/5" style={{ width: 120, height: 80 }}>
                  <div className="absolute bottom-1.5 left-1.5 right-1.5">
                    <div className="mb-0.5 flex justify-between text-[7px] text-zinc-400"><span>CPU</span><span>{Math.round(pod.cpu)}%</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-600/40"><div className="h-full rounded-full bg-brand-400" style={{ width: `${pod.cpu}%` }} /></div>
                  </div>
                  <div className="absolute left-1.5 right-1.5 top-1.5">
                    <div className="mb-0.5 flex justify-between text-[7px] text-zinc-400"><span>Mem</span><span>{Math.round(pod.memory || 40)}%</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-600/40"><div className="h-full rounded-full bg-blue-400" style={{ width: `${pod.memory || 40}%` }} /></div>
                  </div>
                  <span className="text-[8px] text-zinc-400">{pod.label}</span>
                </div>
              ))}
            </div>
          </ScalingScene>

          <NarrationLog entries={sim.state.logs} />
          <SimulatorGuide active={mode === 'simulator'} />
        </>
      )}
    </div>
  );
}
