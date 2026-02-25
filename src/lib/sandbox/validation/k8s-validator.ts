import type { K8sValidationResult, K8sValidationError, K8sResource, SandboxExercise } from '@/types/sandbox';
import { parseYaml } from '../yaml-parser';

const VALID_KINDS = [
  'Deployment', 'Service', 'Pod', 'ConfigMap', 'Secret',
  'HorizontalPodAutoscaler', 'Ingress', 'StatefulSet',
  'DaemonSet', 'Job', 'CronJob', 'Namespace',
  'PersistentVolumeClaim', 'PersistentVolume', 'ServiceAccount',
  'Role', 'RoleBinding', 'ClusterRole', 'ClusterRoleBinding',
  'NetworkPolicy', 'LimitRange', 'ResourceQuota',
];

function validateResource(doc: Record<string, unknown>): { errors: K8sValidationError[]; warnings: K8sValidationError[] } {
  const errors: K8sValidationError[] = [];
  const warnings: K8sValidationError[] = [];

  if (!doc.apiVersion) errors.push({ field: 'apiVersion', message: 'Missing required field: apiVersion', severity: 'error' });
  if (!doc.kind) errors.push({ field: 'kind', message: 'Missing required field: kind', severity: 'error' });
  else if (!VALID_KINDS.includes(doc.kind as string)) {
    warnings.push({ field: 'kind', message: `Unknown kind: ${doc.kind}. Valid kinds include: Deployment, Service, Pod, etc.`, severity: 'warning' });
  }

  const metadata = doc.metadata as Record<string, unknown> | undefined;
  if (!metadata) errors.push({ field: 'metadata', message: 'Missing required field: metadata', severity: 'error' });
  else if (!metadata.name) errors.push({ field: 'metadata.name', message: 'Missing required field: metadata.name', severity: 'error' });

  const kind = doc.kind as string;
  const spec = doc.spec as Record<string, unknown> | undefined;

  if (kind === 'Deployment' || kind === 'StatefulSet') {
    if (!spec) {
      errors.push({ field: 'spec', message: `Missing required field: spec for ${kind}`, severity: 'error' });
    } else {
      if (spec.replicas === undefined) warnings.push({ field: 'spec.replicas', message: 'No replica count specified (defaults to 1)', severity: 'warning' });
      if (!spec.selector) errors.push({ field: 'spec.selector', message: 'Missing required field: spec.selector', severity: 'error' });
      if (!spec.template) errors.push({ field: 'spec.template', message: 'Missing required field: spec.template', severity: 'error' });
      else {
        const template = spec.template as Record<string, unknown>;
        const templateSpec = template?.spec as Record<string, unknown>;
        if (templateSpec?.containers) {
          const containers = templateSpec.containers as Record<string, unknown>[];
          for (const c of containers) {
            if (!c.name) errors.push({ field: 'spec.template.spec.containers[].name', message: 'Container missing name', severity: 'error' });
            if (!c.image) errors.push({ field: 'spec.template.spec.containers[].image', message: 'Container missing image', severity: 'error' });
            else if ((c.image as string).endsWith(':latest') || !(c.image as string).includes(':')) {
              warnings.push({ field: 'spec.template.spec.containers[].image', message: 'Avoid using :latest tag in production', severity: 'warning' });
            }
            if (!c.resources) warnings.push({ field: 'spec.template.spec.containers[].resources', message: 'No resource limits/requests set', severity: 'warning' });
          }
        }
      }
    }
  }

  if (kind === 'Service') {
    if (!spec) {
      errors.push({ field: 'spec', message: 'Missing required field: spec for Service', severity: 'error' });
    } else {
      if (!spec.ports) errors.push({ field: 'spec.ports', message: 'Service missing ports', severity: 'error' });
      if (!spec.selector) warnings.push({ field: 'spec.selector', message: 'Service has no selector (won\'t route to any pods)', severity: 'warning' });
    }
  }

  if (kind === 'HorizontalPodAutoscaler') {
    if (!spec) {
      errors.push({ field: 'spec', message: 'Missing required field: spec for HPA', severity: 'error' });
    } else {
      if (!spec.scaleTargetRef) errors.push({ field: 'spec.scaleTargetRef', message: 'HPA missing scaleTargetRef', severity: 'error' });
      if (spec.minReplicas === undefined) warnings.push({ field: 'spec.minReplicas', message: 'No minReplicas set (defaults to 1)', severity: 'warning' });
      if (!spec.maxReplicas) errors.push({ field: 'spec.maxReplicas', message: 'HPA missing maxReplicas', severity: 'error' });
    }
  }

  if (!metadata?.namespace) warnings.push({ field: 'metadata.namespace', message: 'No namespace specified (will use "default")', severity: 'warning' });

  return { errors, warnings };
}

function docToResource(doc: Record<string, unknown>): K8sResource {
  const metadata = (doc.metadata || {}) as Record<string, unknown>;
  return {
    apiVersion: (doc.apiVersion as string) || '',
    kind: (doc.kind as string) || '',
    name: (metadata.name as string) || '',
    namespace: (metadata.namespace as string) || undefined,
    spec: (doc.spec || {}) as Record<string, unknown>,
  };
}

export function validateK8sManifest(
  yamlString: string,
  exercise?: SandboxExercise
): K8sValidationResult {
  const parsed = parseYaml(yamlString);

  if (!parsed.success && parsed.documents.length === 0) {
    return {
      isValid: false,
      errors: parsed.errors.map((e) => ({
        field: 'yaml',
        message: e.message,
        line: e.line,
        severity: 'error' as const,
      })),
      warnings: [],
      resources: [],
      matchesExpected: false,
    };
  }

  const allErrors: K8sValidationError[] = [];
  const allWarnings: K8sValidationError[] = [];
  const resources: K8sResource[] = [];

  for (const err of parsed.errors) {
    allErrors.push({ field: 'yaml', message: err.message, line: err.line, severity: 'error' });
  }

  for (const doc of parsed.documents) {
    const { errors, warnings } = validateResource(doc);
    allErrors.push(...errors);
    allWarnings.push(...warnings);
    resources.push(docToResource(doc));
  }

  let matchesExpected = false;
  if (exercise) {
    const expectedResources = (exercise.precomputedResults || []) as K8sResource[];
    if (expectedResources.length > 0 && resources.length === expectedResources.length) {
      matchesExpected = resources.every((r, i) => {
        const expected = expectedResources[i];
        return r.kind === expected.kind && r.name === expected.name;
      });
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    resources,
    matchesExpected,
  };
}
