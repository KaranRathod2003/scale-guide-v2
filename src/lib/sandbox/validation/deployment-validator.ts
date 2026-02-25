import type { DeploymentValidationResult, K8sValidationError, SandboxExercise } from '@/types/sandbox';
import { parseYaml } from '../yaml-parser';

type StrategyType = 'RollingUpdate' | 'Recreate' | 'Blue-Green' | 'Canary' | 'A/B Testing' | null;

function detectStrategy(doc: Record<string, unknown>): StrategyType {
  const spec = doc.spec as Record<string, unknown> | undefined;
  if (!spec) return null;

  const strategy = spec.strategy as Record<string, unknown> | undefined;
  if (strategy) {
    const type = strategy.type as string;
    if (type === 'Recreate') return 'Recreate';
    if (type === 'RollingUpdate') return 'RollingUpdate';
  }

  const metadata = doc.metadata as Record<string, unknown> | undefined;
  const annotations = (metadata?.annotations || {}) as Record<string, string>;

  if (annotations['nginx.ingress.kubernetes.io/canary'] === 'true') return 'Canary';
  if (annotations['nginx.ingress.kubernetes.io/canary-weight']) return 'Canary';

  const labels = (metadata?.labels || {}) as Record<string, string>;
  if (labels['deployment-type'] === 'blue-green') return 'Blue-Green';
  if (labels['deployment-type'] === 'canary') return 'Canary';

  return strategy ? 'RollingUpdate' : null;
}

function validateDeploymentSpec(
  doc: Record<string, unknown>,
  detectedStrategy: StrategyType
): { errors: K8sValidationError[]; warnings: K8sValidationError[] } {
  const errors: K8sValidationError[] = [];
  const warnings: K8sValidationError[] = [];

  if (!doc.apiVersion) errors.push({ field: 'apiVersion', message: 'Missing apiVersion', severity: 'error' });
  if (!doc.kind) errors.push({ field: 'kind', message: 'Missing kind', severity: 'error' });

  const spec = doc.spec as Record<string, unknown> | undefined;
  if (!spec) {
    errors.push({ field: 'spec', message: 'Missing spec', severity: 'error' });
    return { errors, warnings };
  }

  const strategy = spec.strategy as Record<string, unknown> | undefined;

  if (detectedStrategy === 'RollingUpdate' && strategy) {
    const rollingUpdate = strategy.rollingUpdate as Record<string, unknown> | undefined;
    if (rollingUpdate) {
      if (rollingUpdate.maxSurge === undefined) {
        warnings.push({ field: 'spec.strategy.rollingUpdate.maxSurge', message: 'No maxSurge specified (defaults to 25%)', severity: 'warning' });
      }
      if (rollingUpdate.maxUnavailable === undefined) {
        warnings.push({ field: 'spec.strategy.rollingUpdate.maxUnavailable', message: 'No maxUnavailable specified (defaults to 25%)', severity: 'warning' });
      }
    } else {
      warnings.push({ field: 'spec.strategy.rollingUpdate', message: 'RollingUpdate strategy without explicit parameters', severity: 'warning' });
    }
  }

  if (detectedStrategy === 'Recreate') {
    const replicas = spec.replicas as number | undefined;
    if (replicas && replicas > 1) {
      warnings.push({ field: 'spec.replicas', message: `Recreate strategy with ${replicas} replicas will cause downtime during deploy`, severity: 'warning' });
    }
  }

  if (!spec.selector) errors.push({ field: 'spec.selector', message: 'Missing selector', severity: 'error' });
  if (!spec.template) errors.push({ field: 'spec.template', message: 'Missing template', severity: 'error' });

  return { errors, warnings };
}

export function validateDeploymentConfig(
  yamlString: string,
  exercise?: SandboxExercise
): DeploymentValidationResult {
  const parsed = parseYaml(yamlString);

  if (!parsed.success && parsed.documents.length === 0) {
    return {
      isValid: false,
      detectedStrategy: null,
      errors: parsed.errors.map((e) => ({
        field: 'yaml',
        message: e.message,
        line: e.line,
        severity: 'error' as const,
      })),
      warnings: [],
      simulationConfig: null,
      matchesExpected: false,
    };
  }

  const allErrors: K8sValidationError[] = [];
  const allWarnings: K8sValidationError[] = [];
  let detectedStrategy: string | null = null;

  for (const err of parsed.errors) {
    allErrors.push({ field: 'yaml', message: err.message, line: err.line, severity: 'error' });
  }

  for (const doc of parsed.documents) {
    const strategy = detectStrategy(doc);
    if (strategy) detectedStrategy = strategy;
    const { errors, warnings } = validateDeploymentSpec(doc, strategy);
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  const simulationConfig = detectedStrategy
    ? { strategy: detectedStrategy, documents: parsed.documents.length }
    : null;

  let matchesExpected = false;
  if (exercise) {
    const expected = exercise.precomputedResults as Record<string, unknown> | undefined;
    if (expected?.strategy && detectedStrategy === expected.strategy) {
      matchesExpected = true;
    }
  }

  return {
    isValid: allErrors.length === 0,
    detectedStrategy,
    errors: allErrors,
    warnings: allWarnings,
    simulationConfig,
    matchesExpected,
  };
}
