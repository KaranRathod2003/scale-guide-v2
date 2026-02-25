export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type ProgrammingLanguage = 'nodejs' | 'python' | 'java' | 'cpp';
export type ConnectionMethod = 'raw-driver' | 'orm' | 'pool' | 'pgbouncer';
export type ExerciseDifficulty = 'basic' | 'intermediate' | 'advanced';

export interface PostgresTopic {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  order: number;
}

export interface ConnectionDriver {
  language: ProgrammingLanguage;
  languageLabel: string;
  methods: {
    id: ConnectionMethod;
    label: string;
    library: string;
    description: string;
    steps: string[];
    codeSnippet: string;
  }[];
}

export interface PgExample {
  id: string;
  title: string;
  difficulty: ExerciseDifficulty;
  description: string;
  setupSQL: string;
  challenge: string;
  hint: string;
  solution: string;
  expectedOutput: Record<string, string | number>[];
}

export interface EnterpriseUseCase {
  company: string;
  industry: string;
  useCase: string;
  scale: string;
  whyPostgres: string;
}

// Simulation types for connection flow
export type ConnectionPhase =
  | 'idle'
  | 'dns-resolve'
  | 'tcp-connect'
  | 'ssl-handshake'
  | 'auth'
  | 'query-send'
  | 'query-execute'
  | 'response'
  | 'complete'
  | 'error';

export interface ConnectionSimState {
  phase: ConnectionPhase;
  tick: number;
  language: ProgrammingLanguage;
  method: ConnectionMethod;
  logs: { step: string; status: 'pending' | 'active' | 'done' | 'error' }[];
}

// Pool visualizer types
export type PoolConnectionStatus = 'idle' | 'active' | 'draining' | 'creating';

export interface PoolConnection {
  id: string;
  status: PoolConnectionStatus;
  queryLabel?: string;
  age: number;
}

export interface PoolState {
  connections: PoolConnection[];
  maxSize: number;
  minSize: number;
  waitQueue: number;
  totalQueries: number;
}

export interface PostgresConversationState {
  step: 1 | 2 | 3 | 4;
  answers: {
    experienceLevel?: ExperienceLevel;
    goal?: string;
    currentStack?: ProgrammingLanguage;
    hasDatabase?: boolean;
    needsScaling?: boolean;
  };
}
