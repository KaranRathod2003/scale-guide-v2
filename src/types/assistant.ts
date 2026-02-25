export type WorkloadType = 'web-api' | 'background-worker' | 'data-pipeline' | 'ml-inference' | 'database' | 'monolith';
export type TrafficPattern = 'steady' | 'spiky' | 'periodic' | 'event-driven' | 'unpredictable';
export type ScalingTrigger = 'cpu' | 'memory' | 'queue-length' | 'custom-events' | 'request-rate' | 'mixed';

export interface ConversationState {
  step: 1 | 2 | 3 | 4;
  answers: {
    workloadType?: WorkloadType;
    isStateful?: boolean;
    trafficPattern?: TrafficPattern;
    scalingTrigger?: ScalingTrigger;
    needsScaleToZero?: boolean;
    complexityTolerance?: 'low' | 'medium' | 'high';
  };
}

export interface AssistantMessage {
  role: 'assistant' | 'user';
  text: string;
  suggestions?: string[];
  recommendation?: Recommendation;
}

export interface Recommendation {
  primary: string;
  secondary?: string;
  confidence: number;
  reasoning: string;
  warnings: string[];
}
