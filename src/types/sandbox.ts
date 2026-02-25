export type SandboxLanguage = 'sql' | 'k8s-yaml' | 'deployment-yaml';
export type SandboxDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface SandboxExercise {
  id: string;
  title: string;
  difficulty: SandboxDifficulty;
  language: SandboxLanguage;
  category: string;
  description: string;
  challenge: string;
  hint: string;
  starterCode: string;
  solution: string;
  alternativeSolutions?: string[];
  requiredKeywords?: string[];
  precomputedResults: unknown;
  setupContext?: string;
}

export interface SqlValidationResult {
  isCorrect: boolean;
  matchType: 'exact' | 'alternative' | 'partial' | 'incorrect';
  feedback: string;
  results: Record<string, string | number>[];
}

export interface K8sResource {
  apiVersion: string;
  kind: string;
  name: string;
  namespace?: string;
  spec: Record<string, unknown>;
}

export interface K8sValidationError {
  field: string;
  message: string;
  line?: number;
  severity: 'error' | 'warning';
}

export interface K8sValidationResult {
  isValid: boolean;
  errors: K8sValidationError[];
  warnings: K8sValidationError[];
  resources: K8sResource[];
  matchesExpected: boolean;
}

export interface DeploymentValidationResult {
  isValid: boolean;
  detectedStrategy: string | null;
  errors: K8sValidationError[];
  warnings: K8sValidationError[];
  simulationConfig: Record<string, unknown> | null;
  matchesExpected: boolean;
}
