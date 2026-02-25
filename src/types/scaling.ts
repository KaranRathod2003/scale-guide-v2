export interface ScalingApproach {
  id: string;
  name: string;
  shortName: string;
  shortDescription: string;
  layer: 'pod' | 'node';
  direction: 'horizontal' | 'vertical' | 'cluster' | 'event-driven';
  bestFor: string[];
  notRecommendedFor: string[];
  metricsUsed: string[];
  scalesFromZero: boolean;
  canCombineWith: string[];
  complexity: 'low' | 'medium' | 'high';
  implementationSteps: string[];
  visualizationConfig: {
    initialPods: number;
    maxPods: number;
    triggerMetric: string;
    triggerThreshold: number;
  };
}

export interface PodState {
  id: string;
  status: 'running' | 'pending' | 'terminating';
  cpu: number;
}

export interface NodeState {
  id: string;
  pods: PodState[];
  capacity: number;
}
