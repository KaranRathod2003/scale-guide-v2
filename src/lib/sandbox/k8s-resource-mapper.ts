import type { K8sResource } from '@/types/sandbox';

export interface VisualResource {
  kind: string;
  name: string;
  icon: 'pod' | 'service' | 'deployment' | 'hpa' | 'configmap' | 'ingress' | 'storage' | 'other';
  details: { label: string; value: string }[];
  children?: VisualResource[];
}

function getIcon(kind: string): VisualResource['icon'] {
  switch (kind) {
    case 'Pod': return 'pod';
    case 'Service': return 'service';
    case 'Deployment': case 'StatefulSet': case 'DaemonSet': return 'deployment';
    case 'HorizontalPodAutoscaler': return 'hpa';
    case 'ConfigMap': case 'Secret': return 'configmap';
    case 'Ingress': return 'ingress';
    case 'PersistentVolumeClaim': case 'PersistentVolume': return 'storage';
    default: return 'other';
  }
}

export function mapResourcesToVisual(resources: K8sResource[]): VisualResource[] {
  return resources.map((r) => {
    const details: { label: string; value: string }[] = [
      { label: 'API Version', value: r.apiVersion },
    ];

    if (r.namespace) details.push({ label: 'Namespace', value: r.namespace });

    const spec = r.spec;

    if (r.kind === 'Deployment' || r.kind === 'StatefulSet') {
      if (spec.replicas !== undefined) details.push({ label: 'Replicas', value: String(spec.replicas) });
      const strategy = spec.strategy as Record<string, unknown> | undefined;
      if (strategy?.type) details.push({ label: 'Strategy', value: String(strategy.type) });
      const template = spec.template as Record<string, unknown> | undefined;
      const templateSpec = template?.spec as Record<string, unknown> | undefined;
      const containers = (templateSpec?.containers || []) as Record<string, unknown>[];
      for (const c of containers) {
        if (c.image) details.push({ label: 'Image', value: String(c.image) });
      }
    }

    if (r.kind === 'Service') {
      const ports = (spec.ports || []) as Record<string, unknown>[];
      for (const p of ports) {
        details.push({ label: 'Port', value: `${p.port}${p.targetPort ? ` -> ${p.targetPort}` : ''}` });
      }
      const type = spec.type as string | undefined;
      if (type) details.push({ label: 'Type', value: type });
    }

    if (r.kind === 'HorizontalPodAutoscaler') {
      if (spec.minReplicas !== undefined) details.push({ label: 'Min Replicas', value: String(spec.minReplicas) });
      if (spec.maxReplicas !== undefined) details.push({ label: 'Max Replicas', value: String(spec.maxReplicas) });
      const ref = spec.scaleTargetRef as Record<string, unknown> | undefined;
      if (ref?.name) details.push({ label: 'Target', value: String(ref.name) });
    }

    if (r.kind === 'Ingress') {
      const rules = (spec.rules || []) as Record<string, unknown>[];
      for (const rule of rules) {
        if (rule.host) details.push({ label: 'Host', value: String(rule.host) });
      }
    }

    return {
      kind: r.kind,
      name: r.name,
      icon: getIcon(r.kind),
      details,
    };
  });
}
