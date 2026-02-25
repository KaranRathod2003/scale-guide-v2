export type IndustryType = 'finance' | 'ecommerce' | 'saas' | 'media' | 'gaming' | 'iot' | 'healthcare' | 'transit' | 'search' | 'ml';
export type RiskTolerance = 'zero-downtime' | 'minimal-downtime' | 'maintenance-window';
export type DeployFrequency = 'continuous' | 'daily' | 'weekly' | 'monthly';

export interface DeploymentStrategy {
  id: string;
  name: string;
  shortName: string;
  shortDescription: string;
  complexity: 'low' | 'medium' | 'high';
  downtime: 'none' | 'minimal' | 'brief';
  rollbackSpeed: 'instant' | 'fast' | 'slow';
  bestFor: string[];
  notRecommendedFor: string[];
  industries: IndustryType[];
  comboWith: string[];
  resourceOverhead: 'low' | 'medium' | 'high';
  implementationSteps: string[];
  realWorldExamples: { company: string; useCase: string }[];
  visualizationConfig: {
    serversV1: number;
    serversV2: number;
    failureTitle: string;
    failureCompany: string;
    successTitle: string;
    successCompany: string;
  };
}

export interface ServerState {
  id: string;
  version: 'v1' | 'v2';
  status: 'running' | 'deploying' | 'failing' | 'draining' | 'stopped';
}

export interface DeploymentConversationState {
  step: 1 | 2 | 3 | 4;
  answers: {
    industryType?: IndustryType;
    serviceName?: string;
    riskTolerance?: RiskTolerance;
    deployFrequency?: DeployFrequency;
    hasSideEffects?: boolean;
    isStateful?: boolean;
    needsBusinessMetrics?: boolean;
    hasServiceMesh?: boolean;
  };
}

export interface DeploymentRecommendation {
  primary: string;
  combo?: string;
  confidence: number;
  reasoning: string;
  warnings: string[];
}
