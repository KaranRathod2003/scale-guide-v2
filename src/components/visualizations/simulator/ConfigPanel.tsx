'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SliderInput from './SliderInput';
import type {
  HPAConfig, VPAConfig, ClusterConfig, KEDAConfig,
  BlueGreenConfig, CanaryConfig, RollingConfig, RecreateConfig,
  ABTestingConfig, ShadowConfig,
} from '@/lib/simulator/types';

type ScalingConfigType = 'hpa' | 'vpa' | 'cluster' | 'keda';
type DeploymentConfigType = 'blue-green' | 'canary' | 'rolling' | 'recreate' | 'ab-testing' | 'shadow';
type ConfigType = ScalingConfigType | DeploymentConfigType;

type AnyConfig =
  | HPAConfig | VPAConfig | ClusterConfig | KEDAConfig
  | BlueGreenConfig | CanaryConfig | RollingConfig | RecreateConfig
  | ABTestingConfig | ShadowConfig;

interface ConfigPanelProps {
  type: ConfigType;
  config: AnyConfig;
  onChange: (config: AnyConfig) => void;
  disabled?: boolean;
}

interface Preset {
  name: string;
  config: Record<string, number | string | number[]>;
}

const hpaPresets: Preset[] = [
  { name: 'Conservative', config: { initialPods: 3, minPods: 2, maxPods: 15, cpuTarget: 50, scaleDownDelay: 10 } },
  { name: 'Balanced', config: { initialPods: 2, minPods: 1, maxPods: 10, cpuTarget: 60, scaleDownDelay: 5 } },
  { name: 'Aggressive', config: { initialPods: 1, minPods: 1, maxPods: 20, cpuTarget: 80, scaleDownDelay: 2 } },
];

const kedaPresets: Preset[] = [
  { name: 'Conservative', config: { minPods: 1, maxPods: 10, queueThreshold: 10, cooldownPeriod: 10, pollingInterval: 3 } },
  { name: 'Balanced', config: { minPods: 0, maxPods: 10, queueThreshold: 5, cooldownPeriod: 5, pollingInterval: 2 } },
  { name: 'Aggressive', config: { minPods: 0, maxPods: 30, queueThreshold: 2, cooldownPeriod: 2, pollingInterval: 1 } },
];

const blueGreenPresets: Preset[] = [
  { name: 'Conservative', config: { replicas: 3, healthCheckDuration: 5, rollbackThreshold: 2 } },
  { name: 'Balanced', config: { replicas: 3, healthCheckDuration: 3, rollbackThreshold: 5 } },
  { name: 'Aggressive', config: { replicas: 2, healthCheckDuration: 1, rollbackThreshold: 10 } },
];

const canaryPresets: Preset[] = [
  { name: 'Conservative', config: { stages: [2, 10, 25, 50, 100], stageDuration: 8, errorThreshold: 1 } },
  { name: 'Balanced', config: { stages: [5, 25, 50, 100], stageDuration: 5, errorThreshold: 3 } },
  { name: 'Aggressive', config: { stages: [10, 50, 100], stageDuration: 3, errorThreshold: 5 } },
];

const rollingPresets: Preset[] = [
  { name: 'Conservative', config: { replicas: 4, maxSurge: 1, maxUnavailable: 0, readinessDelay: 3 } },
  { name: 'Balanced', config: { replicas: 4, maxSurge: 1, maxUnavailable: 1, readinessDelay: 2 } },
  { name: 'Aggressive', config: { replicas: 4, maxSurge: 2, maxUnavailable: 1, readinessDelay: 1 } },
];

const recreatePresets: Preset[] = [
  { name: 'Conservative', config: { replicas: 3, startupTime: 4, shutdownGrace: 3 } },
  { name: 'Balanced', config: { replicas: 3, startupTime: 3, shutdownGrace: 2 } },
  { name: 'Aggressive', config: { replicas: 2, startupTime: 1, shutdownGrace: 1 } },
];

function getPresets(type: ConfigType): Preset[] {
  switch (type) {
    case 'hpa': return hpaPresets;
    case 'keda': return kedaPresets;
    case 'blue-green': return blueGreenPresets;
    case 'canary': return canaryPresets;
    case 'rolling': return rollingPresets;
    case 'recreate': return recreatePresets;
    default: return [];
  }
}

export default function ConfigPanel({ type, config, onChange, disabled = false }: ConfigPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const presets = getPresets(type);

  const update = (key: string, value: number | string) => {
    onChange({ ...config, [key]: value } as AnyConfig);
  };

  return (
    <div data-guide-step="config" className="rounded-lg border border-zinc-600/40 bg-zinc-700/20 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700/40 transition-colors sm:px-4 sm:py-2.5"
      >
        <span className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3l2 1.5" />
          </svg>
          Configuration
        </span>
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          <path d="M3 4.5l3 3 3-3" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-600/30 px-3 py-3 sm:px-4 sm:py-4">
              {/* Presets */}
              {presets.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => !disabled && onChange({ ...config, ...preset.config } as AnyConfig)}
                      disabled={disabled}
                      className="rounded-md border border-zinc-600/40 bg-zinc-600/20 px-2 py-1 text-[10px] font-medium text-zinc-300 transition-colors hover:border-brand-400/30 hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5 sm:text-[11px]"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Sliders grid */}
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                {/* Scaling types */}
                {type === 'hpa' && (
                  <>
                    <SliderInput label="Initial Pods" value={(config as HPAConfig).initialPods} min={1} max={8} onChange={(v) => update('initialPods', v)} disabled={disabled} />
                    <SliderInput label="Min Pods" value={(config as HPAConfig).minPods} min={1} max={5} onChange={(v) => update('minPods', v)} disabled={disabled} />
                    <SliderInput label="Max Pods" value={(config as HPAConfig).maxPods} min={3} max={20} onChange={(v) => update('maxPods', v)} disabled={disabled} />
                    <SliderInput label="CPU Target" value={(config as HPAConfig).cpuTarget} min={30} max={90} unit="%" onChange={(v) => update('cpuTarget', v)} disabled={disabled} />
                    <SliderInput label="Scale-down Delay" value={(config as HPAConfig).scaleDownDelay} min={1} max={15} unit=" ticks" onChange={(v) => update('scaleDownDelay', v)} disabled={disabled} />
                  </>
                )}
                {type === 'vpa' && (
                  <>
                    <SliderInput label="Initial CPU" value={(config as VPAConfig).initialCpuMillis} min={100} max={2000} step={50} unit="m" onChange={(v) => update('initialCpuMillis', v)} disabled={disabled} />
                    <SliderInput label="Initial Memory" value={(config as VPAConfig).initialMemoryMi} min={128} max={4096} step={64} unit="Mi" onChange={(v) => update('initialMemoryMi', v)} disabled={disabled} />
                    <SliderInput label="Max CPU" value={(config as VPAConfig).maxCpuMillis} min={500} max={8000} step={100} unit="m" onChange={(v) => update('maxCpuMillis', v)} disabled={disabled} />
                    <SliderInput label="Max Memory" value={(config as VPAConfig).maxMemoryMi} min={512} max={16384} step={256} unit="Mi" onChange={(v) => update('maxMemoryMi', v)} disabled={disabled} />
                  </>
                )}
                {type === 'cluster' && (
                  <>
                    <SliderInput label="Min Nodes" value={(config as ClusterConfig).minNodes} min={1} max={5} onChange={(v) => update('minNodes', v)} disabled={disabled} />
                    <SliderInput label="Max Nodes" value={(config as ClusterConfig).maxNodes} min={2} max={10} onChange={(v) => update('maxNodes', v)} disabled={disabled} />
                    <SliderInput label="Pods per Node" value={(config as ClusterConfig).podsPerNode} min={4} max={15} onChange={(v) => update('podsPerNode', v)} disabled={disabled} />
                    <SliderInput label="Scale-down Threshold" value={(config as ClusterConfig).scaleDownThreshold} min={20} max={80} unit="%" onChange={(v) => update('scaleDownThreshold', v)} disabled={disabled} />
                    <SliderInput label="Provisioning Time" value={(config as ClusterConfig).provisioningTime} min={1} max={10} unit=" ticks" onChange={(v) => update('provisioningTime', v)} disabled={disabled} />
                  </>
                )}
                {type === 'keda' && (
                  <>
                    <SliderInput label="Min Pods" value={(config as KEDAConfig).minPods} min={0} max={3} onChange={(v) => update('minPods', v)} disabled={disabled} />
                    <SliderInput label="Max Pods" value={(config as KEDAConfig).maxPods} min={5} max={30} onChange={(v) => update('maxPods', v)} disabled={disabled} />
                    <SliderInput label="Queue Threshold" value={(config as KEDAConfig).queueThreshold} min={1} max={50} unit=" msg" onChange={(v) => update('queueThreshold', v)} disabled={disabled} />
                    <SliderInput label="Cooldown Period" value={(config as KEDAConfig).cooldownPeriod} min={1} max={15} unit=" ticks" onChange={(v) => update('cooldownPeriod', v)} disabled={disabled} />
                    <SliderInput label="Polling Interval" value={(config as KEDAConfig).pollingInterval} min={1} max={10} unit=" ticks" onChange={(v) => update('pollingInterval', v)} disabled={disabled} />
                  </>
                )}

                {/* Deployment types */}
                {type === 'blue-green' && (
                  <>
                    <SliderInput label="Replicas" value={(config as BlueGreenConfig).replicas} min={1} max={6} onChange={(v) => update('replicas', v)} disabled={disabled} />
                    <SliderInput label="Health Check" value={(config as BlueGreenConfig).healthCheckDuration} min={1} max={8} unit=" ticks" onChange={(v) => update('healthCheckDuration', v)} disabled={disabled} />
                    <SliderInput label="Rollback Threshold" value={(config as BlueGreenConfig).rollbackThreshold} min={1} max={20} unit="%" onChange={(v) => update('rollbackThreshold', v)} disabled={disabled} />
                  </>
                )}
                {type === 'canary' && (
                  <>
                    <SliderInput label="Stage Duration" value={(config as CanaryConfig).stageDuration} min={2} max={15} unit=" ticks" onChange={(v) => update('stageDuration', v)} disabled={disabled} />
                    <SliderInput label="Error Threshold" value={(config as CanaryConfig).errorThreshold} min={1} max={10} unit="%" onChange={(v) => update('errorThreshold', v)} disabled={disabled} />
                  </>
                )}
                {type === 'rolling' && (
                  <>
                    <SliderInput label="Replicas" value={(config as RollingConfig).replicas} min={2} max={8} onChange={(v) => update('replicas', v)} disabled={disabled} />
                    <SliderInput label="Max Surge" value={(config as RollingConfig).maxSurge} min={0} max={3} onChange={(v) => update('maxSurge', v)} disabled={disabled} />
                    <SliderInput label="Max Unavailable" value={(config as RollingConfig).maxUnavailable} min={0} max={3} onChange={(v) => update('maxUnavailable', v)} disabled={disabled} />
                    <SliderInput label="Readiness Delay" value={(config as RollingConfig).readinessDelay} min={1} max={8} unit=" ticks" onChange={(v) => update('readinessDelay', v)} disabled={disabled} />
                  </>
                )}
                {type === 'recreate' && (
                  <>
                    <SliderInput label="Replicas" value={(config as RecreateConfig).replicas} min={1} max={6} onChange={(v) => update('replicas', v)} disabled={disabled} />
                    <SliderInput label="Startup Time" value={(config as RecreateConfig).startupTime} min={1} max={8} unit=" ticks" onChange={(v) => update('startupTime', v)} disabled={disabled} />
                    <SliderInput label="Shutdown Grace" value={(config as RecreateConfig).shutdownGrace} min={1} max={5} unit=" ticks" onChange={(v) => update('shutdownGrace', v)} disabled={disabled} />
                  </>
                )}
                {type === 'ab-testing' && (
                  <>
                    <SliderInput label="Replicas" value={(config as ABTestingConfig).replicas} min={2} max={8} onChange={(v) => update('replicas', v)} disabled={disabled} />
                    <SliderInput label="A Traffic" value={(config as ABTestingConfig).v1Percent} min={10} max={90} unit="%" onChange={(v) => { update('v1Percent', v); update('v2Percent', 100 - (v as number)); }} disabled={disabled} />
                  </>
                )}
                {type === 'shadow' && (
                  <>
                    <SliderInput label="Replicas" value={(config as ShadowConfig).replicas} min={1} max={6} onChange={(v) => update('replicas', v)} disabled={disabled} />
                    <SliderInput label="Mirror %" value={(config as ShadowConfig).mirrorPercent} min={10} max={100} step={10} unit="%" onChange={(v) => update('mirrorPercent', v)} disabled={disabled} />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
