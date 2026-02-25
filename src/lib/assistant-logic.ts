import type { ConversationState, AssistantMessage, Recommendation, WorkloadType, TrafficPattern, ScalingTrigger } from '@/types/assistant';

const workloadKeywords: Record<WorkloadType, string[]> = {
  'web-api': ['api', 'rest', 'graphql', 'web', 'http', 'frontend', 'website', 'server', 'express', 'fastapi', 'nginx', 'service', 'endpoint'],
  'background-worker': ['worker', 'background', 'consumer', 'processor', 'queue', 'job', 'celery', 'sidekiq', 'bull'],
  'data-pipeline': ['pipeline', 'etl', 'stream', 'batch', 'spark', 'kafka', 'data', 'processing', 'ingest', 'airflow'],
  'ml-inference': ['ml', 'machine learning', 'inference', 'model', 'prediction', 'gpu', 'tensorflow', 'pytorch', 'ai'],
  'database': ['database', 'db', 'postgres', 'mysql', 'mongo', 'redis', 'stateful', 'storage', 'cache'],
  'monolith': ['monolith', 'legacy', 'single', 'large app', 'all-in-one'],
};

const trafficKeywords: Record<TrafficPattern, string[]> = {
  steady: ['steady', 'constant', 'stable', 'consistent', 'predictable', 'regular'],
  spiky: ['spike', 'spiky', 'burst', 'sudden', 'flash', 'peak', 'black friday'],
  periodic: ['periodic', 'daily', 'hourly', 'weekly', 'business hours', 'schedule', 'cron', 'night'],
  'event-driven': ['event', 'message', 'queue', 'trigger', 'webhook', 'notification'],
  unpredictable: ['unpredictable', 'random', 'variable', 'unknown', 'fluctuating'],
};

const triggerKeywords: Record<ScalingTrigger, string[]> = {
  cpu: ['cpu', 'compute', 'processing power'],
  memory: ['memory', 'ram', 'oom', 'out of memory'],
  'queue-length': ['queue', 'message', 'backlog', 'pending', 'depth'],
  'custom-events': ['event', 'webhook', 'trigger', 'external'],
  'request-rate': ['request', 'rps', 'throughput', 'latency', 'traffic'],
  mixed: ['mixed', 'multiple', 'combination'],
};

function extractBestMatch<T extends string>(text: string, keywords: Record<T, string[]>): T | undefined {
  const lower = text.toLowerCase();
  let bestMatch: T | undefined;
  let bestScore = 0;
  for (const [type, kws] of Object.entries(keywords) as [T, string[]][]) {
    const score = kws.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = type;
    }
  }
  return bestScore > 0 ? bestMatch : undefined;
}

function formatWorkloadType(type?: WorkloadType): string {
  const names: Record<WorkloadType, string> = {
    'web-api': 'web API / HTTP service',
    'background-worker': 'background worker',
    'data-pipeline': 'data pipeline',
    'ml-inference': 'ML inference service',
    'database': 'database',
    'monolith': 'monolith',
  };
  return type ? names[type] : 'workload';
}

const approachNames: Record<string, string> = {
  hpa: 'Horizontal Pod Autoscaler (HPA)',
  vpa: 'Vertical Pod Autoscaler (VPA)',
  'cluster-autoscaler': 'Cluster Autoscaler',
  keda: 'KEDA',
};

export function generateRecommendation(answers: ConversationState['answers']): Recommendation {
  const { workloadType, isStateful, trafficPattern, scalingTrigger, needsScaleToZero } = answers;

  if (scalingTrigger === 'queue-length' || scalingTrigger === 'custom-events' || trafficPattern === 'event-driven') {
    return {
      primary: 'keda',
      secondary: 'cluster-autoscaler',
      confidence: 90,
      reasoning: 'Your event-driven workload is a perfect fit for KEDA. It can scale based on queue length or custom event sources, and uniquely supports scaling to zero when there are no events to process.',
      warnings: needsScaleToZero ? [] : ['KEDA adds operational complexity. If you don\'t need scale-to-zero or custom event sources, HPA may be simpler.'],
    };
  }

  if (isStateful || workloadType === 'database') {
    return {
      primary: 'vpa',
      secondary: 'cluster-autoscaler',
      confidence: 85,
      reasoning: 'Stateful workloads like databases cannot easily scale horizontally. VPA automatically adjusts CPU and memory requests so your pods have the right resources without manual tuning.',
      warnings: [
        'VPA may restart pods to apply new resource values. Ensure your app handles restarts gracefully.',
      ],
    };
  }

  if ((workloadType === 'web-api' || workloadType === 'ml-inference') && (trafficPattern === 'spiky' || trafficPattern === 'unpredictable')) {
    return {
      primary: 'hpa',
      secondary: 'cluster-autoscaler',
      confidence: 92,
      reasoning: 'Your stateless workload with variable traffic is the textbook use case for HPA. It automatically adds pod replicas when CPU or request rate exceeds your threshold, and removes them when traffic subsides.',
      warnings: [],
    };
  }

  if (workloadType === 'background-worker') {
    if (needsScaleToZero) {
      return {
        primary: 'keda',
        secondary: 'cluster-autoscaler',
        confidence: 88,
        reasoning: 'For background workers that need scale-to-zero, KEDA is the best choice. It watches your message queue and spins up workers only when there is work to do.',
        warnings: [],
      };
    }
    return {
      primary: 'hpa',
      secondary: 'cluster-autoscaler',
      confidence: 80,
      reasoning: 'HPA can scale your workers based on CPU or custom metrics. If your workers pull from a queue, consider KEDA for more precise queue-based scaling.',
      warnings: ['If you need scale-to-zero, HPA cannot do this -- consider KEDA instead.'],
    };
  }

  if (workloadType === 'data-pipeline') {
    return {
      primary: 'keda',
      secondary: 'hpa',
      confidence: 82,
      reasoning: 'Data pipelines benefit from event-driven scaling. KEDA can scale based on your data backlog, Kafka consumer lag, or other pipeline-specific metrics.',
      warnings: [],
    };
  }

  if (trafficPattern === 'periodic') {
    return {
      primary: 'hpa',
      secondary: 'keda',
      confidence: 78,
      reasoning: 'For predictable periodic patterns, combine HPA for reactive scaling with KEDA\'s cron trigger for proactive pre-scaling before traffic windows.',
      warnings: [],
    };
  }

  return {
    primary: 'hpa',
    secondary: 'cluster-autoscaler',
    confidence: 70,
    reasoning: 'Based on your description, HPA is a solid starting point. It handles most common scaling scenarios and is the simplest to set up. Pair it with Cluster Autoscaler for node-level elasticity.',
    warnings: ['This is a general recommendation. More details about your workload could yield a more specific suggestion.'],
  };
}

export function processUserMessage(message: string, state: ConversationState): ConversationState {
  const newState = { ...state, answers: { ...state.answers } };

  switch (state.step) {
    case 1: {
      const workloadType = extractBestMatch(message, workloadKeywords);
      const isStateful = ['database', 'monolith'].includes(workloadType || '');
      newState.answers.workloadType = workloadType;
      newState.answers.isStateful = isStateful;
      const trafficPattern = extractBestMatch(message, trafficKeywords);
      if (trafficPattern) newState.answers.trafficPattern = trafficPattern;
      newState.step = 2;
      break;
    }
    case 2: {
      const scalingTrigger = extractBestMatch(message, triggerKeywords);
      if (scalingTrigger) newState.answers.scalingTrigger = scalingTrigger;
      const trafficPattern = extractBestMatch(message, trafficKeywords);
      if (trafficPattern) newState.answers.trafficPattern = trafficPattern;
      newState.step = 3;
      break;
    }
    case 3: {
      const lower = message.toLowerCase();
      newState.answers.needsScaleToZero = lower.includes('zero') || lower.includes('idle') || lower.includes('scale to zero');
      if (lower.includes('simple') || lower.includes('easy') || lower.includes('basic')) {
        newState.answers.complexityTolerance = 'low';
      } else if (lower.includes('complex') || lower.includes('advanced') || lower.includes('ok') || lower.includes('fine')) {
        newState.answers.complexityTolerance = 'high';
      } else {
        newState.answers.complexityTolerance = 'medium';
      }
      newState.step = 4;
      break;
    }
  }

  return newState;
}

export function getStepMessage(state: ConversationState): AssistantMessage {
  switch (state.step) {
    case 1:
      return {
        role: 'assistant',
        text: "Hi! I'm ScaleGuide AI. Tell me about your project -- what kind of workload are you running on Kubernetes? For example: a web API, background workers, a database, or a data pipeline.",
        suggestions: ['Web API / HTTP service', 'Background workers', 'Data pipeline', 'ML inference', 'Database', 'Not sure yet'],
      };
    case 2:
      return {
        role: 'assistant',
        text: `Got it -- a ${formatWorkloadType(state.answers.workloadType)}. What typically triggers your need to scale? Is it CPU/memory pressure, queue depth, traffic spikes, or something else?`,
        suggestions: ['CPU/Memory pressure', 'Queue filling up', 'Traffic spikes', 'Scheduled events', 'Custom business metrics'],
      };
    case 3:
      return {
        role: 'assistant',
        text: 'Almost there! Does your workload need to scale to zero when idle? And how much operational complexity are you comfortable with?',
        suggestions: ['Need scale-to-zero', 'Always running is fine', 'Keep it simple', 'Complexity is OK'],
      };
    case 4: {
      const rec = generateRecommendation(state.answers);
      return {
        role: 'assistant',
        text: `Based on your answers, I recommend **${approachNames[rec.primary] || rec.primary}**${rec.secondary ? ` paired with **${approachNames[rec.secondary] || rec.secondary}**` : ''}.\n\n${rec.reasoning}${rec.warnings.length > 0 ? '\n\n**Heads up:** ' + rec.warnings.join(' ') : ''}`,
        recommendation: rec,
        suggestions: ['Start over'],
      };
    }
    default:
      return {
        role: 'assistant',
        text: "Hi! I'm ScaleGuide AI. Tell me about your project.",
        suggestions: [],
      };
  }
}
