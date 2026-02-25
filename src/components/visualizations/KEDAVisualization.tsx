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
import { getKEDAHints } from '@/lib/simulator/hintEngine';
import type { KEDAConfig, EventDef } from '@/lib/simulator/types';

interface Pod {
  id: string;
  status: 'running' | 'pending' | 'terminating';
  cpu: number;
}

const scenarios: Scenario[] = [
  {
    id: 'swiggy-orders',
    name: 'Lunch Rush Orders',
    description: 'Swiggy/Zomato processes 50,000 orders between 12-1 PM via RabbitMQ. KEDA scales from 0 to 40 consumer pods, then back to 0 by 2 PM.',
    company: 'Swiggy/Zomato (pattern)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4h12M4 4v8a1 1 0 001 1h6a1 1 0 001-1V4M6 1h4" />
      </svg>
    ),
  },
  {
    id: 'stripe-webhooks',
    name: 'Payment Webhook Burst',
    description: 'Stripe-style webhook processor. Subscription renewal night: 500K webhooks hit in 10 minutes. KEDA scales based on SQS queue depth.',
    company: 'Stripe (pattern)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" transform="scale(0.85) translate(1,1)" />
      </svg>
    ),
  },
  {
    id: 'cron-prewarming',
    name: 'Cron-Based Pre-Warming',
    description: 'A news app pre-scales content processors every morning at 5 AM before the morning reading rush. KEDA cron trigger + HTTP scaler combo.',
    company: 'News App Pattern',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6" /><path d="M8 4v4l3 2" />
      </svg>
    ),
  },
];

const kedaEvents: EventDef[] = [
  { type: 'queue_burst', label: 'Queue Burst', icon: '\uD83D\uDCEC', description: 'Add 500 messages to queue' },
  { type: 'traffic_spike_2x', label: 'Spike 2x', icon: '\uD83D\uDD25', description: 'Double traffic' },
  { type: 'cool_down', label: 'Drain Queue', icon: '\uD83E\uDDCA', description: 'Drain queue to zero' },
  { type: 'pod_crash', label: 'Crash Pod', icon: '\uD83D\uDC80', description: 'Kill a worker pod' },
];

let logCounter = 0;
function createLog(message: string, type: LogEntry['type'], time: string): LogEntry {
  return { id: `keda-log-${++logCounter}`, timestamp: time, message, type };
}

const defaultKEDAConfig: KEDAConfig = {
  minPods: 0,
  maxPods: 10,
  queueThreshold: 5,
  cooldownPeriod: 5,
  pollingInterval: 2,
};

export default function KEDAVisualization() {
  const [mode, setMode] = useState<'stories' | 'simulator'>('stories');

  // ── Simulator ──
  const [simConfig, setSimConfig] = useState<KEDAConfig>(defaultKEDAConfig);
  const sim = useSimulation('keda', simConfig);
  const hints = useMemo(() => getKEDAHints(simConfig), [simConfig]);

  // ── Story state ──
  const [pods, setPods] = useState<Pod[]>([]);
  const [queueDepth, setQueueDepth] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [queueLabel, setQueueLabel] = useState('message-queue');
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
    setPods([]);
    setQueueDepth(0);
    setLogs([]);
    setIsRunning(false);
    setActiveScenario(null);
    setQueueLabel('message-queue');
  }, []);

  // ── Stories (unchanged) ──

  const runSwiggyOrders = useCallback(() => {
    setIsRunning(true);
    setActiveScenario('swiggy-orders');
    setLogs([]);
    setQueueLabel('orders-queue (RabbitMQ)');

    addLog('11:00 AM - Few morning orders. Queue empty. 0 pods running (scaled to zero)', 'info', '11:00');
    addLog('KEDA ScaledObject: minReplicas=0, trigger=rabbitmq, queueLength threshold=10', 'info', '11:00');

    schedule(() => { addLog('11:45 AM - Pre-lunch orders trickling in. Queue: 0 \u2192 8 messages', 'info', '11:45'); setQueueDepth(8); }, 2500);
    schedule(() => { addLog('11:50 AM - Queue depth at 12. Exceeds threshold of 10!', 'warning', '11:50'); addLog('KEDA: Activation! Scaling deployment from 0 \u2192 1 (first pod)', 'action', '11:50'); addLog('This is the key difference from HPA: KEDA can wake up from zero', 'info', '11:50'); setQueueDepth(12); setPods([{ id: 'sw-1', status: 'pending', cpu: 0 }]); }, 4500);
    schedule(() => { addLog('Pod order-processor-1 Running. Processing orders at 50/min', 'success', '11:51'); setPods([{ id: 'sw-1', status: 'running', cpu: 65 }]); setQueueDepth(15); }, 6500);
    schedule(() => { addLog('12:00 PM - LUNCH RUSH! Orders flooding in: 200/min \u2192 500/min', 'error', '12:00'); addLog('Queue depth exploding: 15 \u2192 80 \u2192 200 messages!', 'error', '12:01'); setQueueDepth(200); }, 8500);
    schedule(() => { addLog('KEDA: Queue=200, threshold=10. desiredReplicas = 200/10 = 20 pods', 'action', '12:01'); addLog('KEDA feeds metric to HPA. HPA scaling 1 \u2192 8 (maxReplicaCount rate limit)', 'action', '12:01'); const newPods: Pod[] = Array.from({ length: 7 }, (_, i) => ({ id: `sw-${Date.now()}-${i}`, status: 'pending' as const, cpu: 0 })); setPods((prev) => [...prev, ...newPods]); setQueueDepth(250); }, 10500);
    schedule(() => { addLog('8 pods Running. Processing 400 orders/min. Queue stabilizing.', 'success', '12:03'); addLog('But queue still growing: 250 \u2192 300. Need more pods!', 'warning', '12:04'); setPods((prev) => prev.map((p) => ({ ...p, status: 'running', cpu: 75 + Math.random() * 15 }))); setQueueDepth(300); }, 12500);
    schedule(() => { addLog('KEDA: Next scaling cycle. 8 \u2192 15 pods. Processing capacity: 750 orders/min', 'action', '12:05'); const morePods: Pod[] = Array.from({ length: 7 }, (_, i) => ({ id: `sw-wave2-${Date.now()}-${i}`, status: 'pending' as const, cpu: 0 })); setPods((prev) => [...prev, ...morePods]); }, 14500);
    schedule(() => { addLog('15 pods Running. Queue draining: 300 \u2192 150 \u2192 50', 'success', '12:10'); setPods((prev) => prev.map((p) => ({ ...p, status: 'running', cpu: 55 + Math.random() * 20 }))); setQueueDepth(50); }, 16500);
    schedule(() => { addLog('12:30 PM - Lunch rush subsiding. Queue: 50 \u2192 10 \u2192 0', 'info', '12:30'); setQueueDepth(5); setPods((prev) => prev.map((p) => ({ ...p, cpu: 15 + Math.random() * 10 }))); }, 18500);
    schedule(() => { addLog('Queue empty. KEDA cooldownPeriod: 120 seconds. Waiting...', 'info', '12:32'); addLog('Cooldown prevents premature scale-down if a few more orders come in', 'info', '12:33'); setQueueDepth(0); }, 20500);
    schedule(() => { addLog('Cooldown passed. KEDA scaling 15 \u2192 0 pods. Back to zero!', 'action', '12:35'); addLog('Cost: Pods only ran for ~35 minutes. Zero cost when queue is empty.', 'success', '12:35'); setPods([]); setIsRunning(false); }, 23000);
  }, [addLog, schedule]);

  const runStripeWebhooks = useCallback(() => {
    setIsRunning(true);
    setActiveScenario('stripe-webhooks');
    setLogs([]);
    setQueueLabel('webhooks-queue (AWS SQS)');

    addLog('2:00 AM - Subscription renewal batch starts. SQS queue idle.', 'info', '02:00');
    addLog('KEDA config: trigger=aws-sqs, queueLength=20, minReplicas=0', 'info', '02:00');

    schedule(() => { addLog('Billing system enqueues 500,000 webhook events for subscription renewals', 'warning', '02:00'); addLog('SQS visible messages: 0 \u2192 50,000 in first minute', 'error', '02:01'); setQueueDepth(500); }, 2500);
    schedule(() => { addLog('KEDA: SQS depth=50,000, threshold=20. Desired = 50,000/20 = 2,500!', 'action', '02:01'); addLog('But maxReplicaCount=30. Scaling 0 \u2192 30 pods (capped at max)', 'action', '02:01'); addLog('KEDA prevents runaway scaling with maxReplicaCount safeguard', 'info', '02:01'); const burst: Pod[] = Array.from({ length: 10 }, (_, i) => ({ id: `wh-${Date.now()}-${i}`, status: 'pending' as const, cpu: 0 })); setPods(burst); }, 5000);
    schedule(() => { addLog('10 pods Running. Each processes ~500 webhooks/min', 'success', '02:03'); addLog('KEDA: Still above threshold. Scaling 10 \u2192 20 pods', 'action', '02:03'); setPods((prev) => { const running = prev.map((p) => ({ ...p, status: 'running' as const, cpu: 80 })); const more: Pod[] = Array.from({ length: 10 }, (_, i) => ({ id: `wh-w2-${Date.now()}-${i}`, status: 'pending' as const, cpu: 0 })); return [...running, ...more]; }); setQueueDepth(400); }, 7500);
    schedule(() => { addLog('20 pods Running. Processing 10,000 webhooks/min. Queue shrinking.', 'success', '02:05'); addLog('Queue: 400K \u2192 300K \u2192 200K', 'info', '02:07'); setPods((prev) => prev.map((p) => ({ ...p, status: 'running', cpu: 70 + Math.random() * 15 }))); setQueueDepth(200); }, 10000);
    schedule(() => { addLog('Queue: 200K \u2192 50K. Light at the end of the tunnel.', 'info', '02:20'); setQueueDepth(50); setPods((prev) => prev.map((p) => ({ ...p, cpu: 40 + Math.random() * 15 }))); }, 13000);
    schedule(() => { addLog('2:45 AM - Queue drained! All 500K webhooks processed in 45 minutes', 'success', '02:45'); addLog('Cooldown period starting (300 seconds for webhook processor)', 'info', '02:45'); setQueueDepth(0); }, 16000);
    schedule(() => { addLog('2:50 AM - Cooldown passed. Scaling 20 \u2192 0. Infrastructure cost: ~$3.80', 'success', '02:50'); addLog('Without KEDA: would need 20 pods running 24/7 = $130/day', 'info', '02:50'); setPods([]); setIsRunning(false); }, 19000);
  }, [addLog, schedule]);

  const runCronPrewarming = useCallback(() => {
    setIsRunning(true);
    setActiveScenario('cron-prewarming');
    setLogs([]);
    setQueueLabel('content-queue');

    addLog('3:00 AM - Night time. 0 content processor pods. No traffic.', 'info', '03:00');
    addLog('KEDA has TWO triggers: cron (5:00 AM = 5 pods) + HTTP (req/s > 100)', 'info', '03:00');

    schedule(() => { addLog('4:55 AM - KEDA cron trigger activating in 5 minutes...', 'info', '04:55'); }, 2500);
    schedule(() => { addLog('5:00 AM - CRON TRIGGER fires! Scaling 0 \u2192 5 pods preemptively', 'action', '05:00'); addLog('No traffic yet, but pods are warming up before the morning rush', 'action', '05:00'); const prewarm: Pod[] = Array.from({ length: 5 }, (_, i) => ({ id: `cron-${Date.now()}-${i}`, status: 'pending' as const, cpu: 0 })); setPods(prewarm); }, 5000);
    schedule(() => { addLog('5:01 AM - All 5 pods Running. Caches warming, DB connections pooled', 'success', '05:01'); addLog('When users arrive, there will be ZERO cold start latency!', 'info', '05:01'); setPods((prev) => prev.map((p) => ({ ...p, status: 'running', cpu: 10 }))); }, 7500);
    schedule(() => { addLog('6:00 AM - Morning readers arrive. Traffic: 50 \u2192 150 req/s', 'info', '06:00'); addLog('HTTP trigger activates: req/s (150) > threshold (100). Scaling 5 \u2192 8', 'action', '06:00'); setPods((prev) => { const updated = prev.map((p) => ({ ...p, cpu: 55 })); const more: Pod[] = Array.from({ length: 3 }, (_, i) => ({ id: `http-${Date.now()}-${i}`, status: 'pending' as const, cpu: 0 })); return [...updated, ...more]; }); setQueueDepth(30); }, 10000);
    schedule(() => { addLog('8 pods handling morning traffic smoothly. No user experienced cold start.', 'success', '06:05'); addLog('Compare without cron pre-warming: first users wait 30-60s for cold start!', 'warning', '06:05'); setPods((prev) => prev.map((p) => ({ ...p, status: 'running', cpu: 45 + Math.random() * 15 }))); setQueueDepth(50); }, 12500);
    schedule(() => { addLog('10:00 AM - Traffic normalizing. KEDA scaling down 8 \u2192 3', 'info', '10:00'); addLog('Cron trigger no longer active (window: 5AM-9AM). HTTP trigger manages rest', 'info', '10:01'); setPods((prev) => prev.slice(0, 3).map((p) => ({ ...p, cpu: 25 }))); setQueueDepth(10); }, 15000);
    schedule(() => { addLog('11:00 PM - Traffic drops to zero. KEDA scales to 0. Cycle repeats tomorrow.', 'success', '23:00'); addLog('KEDA cron + HTTP combo = proactive + reactive scaling. Best of both worlds.', 'info', '23:00'); setPods([]); setQueueDepth(0); setIsRunning(false); }, 18000);
  }, [addLog, schedule]);

  const handleScenarioSelect = useCallback((id: string) => {
    reset();
    setTimeout(() => {
      if (id === 'swiggy-orders') runSwiggyOrders();
      else if (id === 'stripe-webhooks') runStripeWebhooks();
      else if (id === 'cron-prewarming') runCronPrewarming();
    }, 100);
  }, [reset, runSwiggyOrders, runStripeWebhooks, runCronPrewarming]);

  const handleModeChange = useCallback((newMode: 'stories' | 'simulator') => {
    if (newMode === 'stories') { sim.pause(); sim.reset(); } else { reset(); }
    setMode(newMode);
  }, [reset, sim]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">KEDA (Event-Driven Autoscaler)</h3>
          <p className="text-xs text-zinc-300 sm:text-sm">Scales from zero based on external events. 70+ trigger types.</p>
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
            isFlowing={isRunning && queueDepth > 0}
            trafficIntensity={Math.min(Math.ceil(queueDepth / 80), 5)}
            variant="event-driven"
            deploymentName={queueLabel}
            sourceName="Events"
            routerName="Queue"
            podCount={pods.filter((p) => p.status === 'running').length}
            totalCount={pods.length}
          >
            <div className="space-y-2">
              <div className="rounded-lg border border-zinc-600/40 bg-zinc-700/30 p-2">
                <div className="mb-1.5 flex items-center justify-between text-[9px]">
                  <span className="text-zinc-300">Queue Depth</span>
                  <span className="font-mono text-amber-400">{queueDepth > 0 ? `~${queueDepth}K` : '0'}</span>
                </div>
                <div className="flex h-8 flex-col-reverse gap-0.5 overflow-hidden">
                  {queueDepth > 0 ? (
                    Array.from({ length: Math.min(Math.ceil(queueDepth / 30), 12) }, (_, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="h-1.5 rounded bg-amber-500/30" style={{ width: `${50 + Math.random() * 50}%` }} />
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center text-[8px] text-zinc-400">Empty</div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <AnimatePresence mode="popLayout">
                  {pods.map((pod, i) => (
                    <motion.div key={pod.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }} layout>
                      <PodIcon status={pod.status} cpu={Math.round(pod.cpu)} size={24} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {pods.length === 0 && (
                  <div className="flex w-full items-center justify-center py-2 text-[9px] text-zinc-400">
                    {activeScenario ? 'Waiting for events...' : 'Scaled to zero'}
                  </div>
                )}
              </div>
            </div>
          </ScalingScene>

          <NarrationLog entries={logs} />
        </>
      ) : (
        <>
          <ConfigPanel type="keda" config={simConfig} onChange={(c) => setSimConfig(c as KEDAConfig)} disabled={sim.isRunning} />
          <SmartHints hints={hints} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TimelineControls isRunning={sim.isRunning} onPlay={sim.start} onPause={sim.pause} onReset={sim.reset} speed={sim.speed} onSpeedChange={sim.changeSpeed} tick={sim.state.tick} />
            <EventTriggerBar events={kedaEvents} onTrigger={sim.triggerEvent} disabled={!sim.isRunning} />
          </div>

          <LiveMetricsBar metrics={sim.state.metrics} />

          <ScalingScene
            isFlowing={sim.isRunning && sim.state.queueDepth > 0}
            trafficIntensity={Math.min(Math.ceil(sim.state.queueDepth / 80), 5)}
            variant="event-driven"
            deploymentName="worker-queue"
            sourceName="Events"
            routerName="Queue"
            podCount={sim.state.pods.filter((p) => p.status === 'running').length}
            totalCount={sim.state.pods.length}
          >
            <div className="space-y-2">
              <div className="rounded-lg border border-zinc-600/40 bg-zinc-700/30 p-2">
                <div className="mb-1.5 flex items-center justify-between text-[9px]">
                  <span className="text-zinc-300">Queue Depth</span>
                  <span className="font-mono text-amber-400">{sim.state.queueDepth > 0 ? sim.state.queueDepth : '0'}</span>
                </div>
                <div className="flex h-8 flex-col-reverse gap-0.5 overflow-hidden">
                  {sim.state.queueDepth > 0 ? (
                    Array.from({ length: Math.min(Math.ceil(sim.state.queueDepth / 30), 12) }, (_, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="h-1.5 rounded bg-amber-500/30" style={{ width: `${50 + Math.random() * 50}%` }} />
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center text-[8px] text-zinc-400">Empty</div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <AnimatePresence mode="popLayout">
                  {sim.state.pods.map((pod, i) => (
                    <motion.div key={pod.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }} layout>
                      <PodIcon status={pod.status} cpu={Math.round(pod.cpu)} size={24} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {sim.state.pods.length === 0 && (
                  <div className="flex w-full items-center justify-center py-2 text-[9px] text-zinc-400">Scaled to zero</div>
                )}
              </div>
            </div>
          </ScalingScene>

          <NarrationLog entries={sim.state.logs} />
          <SimulatorGuide active={mode === 'simulator'} />
        </>
      )}
    </div>
  );
}
