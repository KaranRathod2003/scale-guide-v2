import type { DeploymentConversationState, DeploymentRecommendation, IndustryType, RiskTolerance, DeployFrequency } from '@/types/deployment';
import type { AssistantMessage } from '@/types/assistant';

const industryKeywords: Record<IndustryType, string[]> = {
  finance: ['bank', 'finance', 'financial', 'trading', 'payment', 'fintech', 'insurance', 'capital', 'investment'],
  ecommerce: ['ecommerce', 'e-commerce', 'shop', 'store', 'cart', 'checkout', 'retail', 'marketplace', 'catalog', 'product'],
  saas: ['saas', 'platform', 'subscription', 'multi-tenant', 'b2b', 'dashboard', 'analytics', 'crm'],
  media: ['media', 'streaming', 'video', 'content', 'news', 'social', 'entertainment', 'broadcast'],
  gaming: ['game', 'gaming', 'player', 'match', 'multiplayer', 'esports', 'server'],
  iot: ['iot', 'edge', 'sensor', 'device', 'gateway', 'embedded', 'industrial', 'smart'],
  healthcare: ['health', 'medical', 'patient', 'clinical', 'hospital', 'pharma', 'ehr'],
  transit: ['transit', 'transport', 'logistics', 'shipping', 'delivery', 'fleet', 'route', 'fare'],
  search: ['search', 'ranking', 'indexing', 'query', 'relevance', 'recommendation'],
  ml: ['ml', 'machine learning', 'model', 'prediction', 'inference', 'ai', 'neural', 'training'],
};

const riskKeywords: Record<RiskTolerance, string[]> = {
  'zero-downtime': ['zero', 'no downtime', 'always up', 'critical', 'cant go down', 'mission critical', '99.99', 'five nines', 'sla'],
  'minimal-downtime': ['minimal', 'brief', 'acceptable', 'low tolerance', 'important', 'some downtime'],
  'maintenance-window': ['maintenance', 'window', 'scheduled', 'off-peak', 'overnight', 'weekend', 'planned'],
};

const frequencyKeywords: Record<DeployFrequency, string[]> = {
  continuous: ['continuous', 'ci/cd', 'multiple times', 'hourly', 'constantly', 'always deploying', 'gitops'],
  daily: ['daily', 'every day', 'once a day', 'nightly'],
  weekly: ['weekly', 'every week', 'once a week', 'sprint'],
  monthly: ['monthly', 'every month', 'quarterly', 'release cycle', 'rare', 'infrequent'],
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

function formatIndustry(type?: IndustryType): string {
  const names: Record<IndustryType, string> = {
    finance: 'financial services',
    ecommerce: 'e-commerce',
    saas: 'SaaS platform',
    media: 'media / streaming',
    gaming: 'gaming',
    iot: 'IoT / edge computing',
    healthcare: 'healthcare',
    transit: 'transit / logistics',
    search: 'search / discovery',
    ml: 'ML / AI inference',
  };
  return type ? names[type] : 'your service';
}

const strategyNames: Record<string, string> = {
  'blue-green': 'Blue-Green Deployment',
  canary: 'Canary Deployment',
  'rolling-update': 'Rolling Update',
  recreate: 'Recreate Deployment',
  'ab-testing': 'A/B Testing Deployment',
  shadow: 'Shadow (Dark) Deployment',
};

export function generateDeploymentRecommendation(answers: DeploymentConversationState['answers']): DeploymentRecommendation {
  const { industryType, riskTolerance, hasSideEffects, isStateful, needsBusinessMetrics, hasServiceMesh } = answers;

  // Shadow deployment for ML/search/finance validation
  if ((industryType === 'ml' || industryType === 'search') && !hasSideEffects && hasServiceMesh) {
    return {
      primary: 'shadow',
      combo: 'canary',
      confidence: 90,
      reasoning: 'Your ML/search workload is ideal for shadow deployment. Mirror live traffic to validate the new model with zero user impact, then follow up with a canary for real-traffic validation.',
      warnings: ['Ensure shadow mode disables all write operations to prevent data contamination.'],
    };
  }

  // Blue-Green for zero-downtime finance/healthcare/transit
  if (riskTolerance === 'zero-downtime' && (industryType === 'finance' || industryType === 'healthcare' || industryType === 'transit')) {
    return {
      primary: 'blue-green',
      combo: 'canary',
      confidence: 92,
      reasoning: 'Zero-downtime requirement in a regulated industry makes Blue-Green ideal. Instant rollback protects against deployment failures. Combine with canary for pre-validation.',
      warnings: isStateful ? ['Ensure database schema changes are backward-compatible for clean rollback.'] : [],
    };
  }

  // A/B Testing for business metrics focus
  if (needsBusinessMetrics && hasServiceMesh && (industryType === 'ecommerce' || industryType === 'media' || industryType === 'saas')) {
    return {
      primary: 'ab-testing',
      combo: 'canary',
      confidence: 85,
      reasoning: 'Your need to measure business impact makes A/B testing the right choice. Route user segments to different versions and measure conversion, engagement, or revenue directly.',
      warnings: ['Monitor multiple metrics (conversion, bounce rate, retention) to avoid misleading conclusions.'],
    };
  }

  // Canary for high-traffic SaaS/ecommerce
  if ((industryType === 'ecommerce' || industryType === 'saas' || industryType === 'media') && riskTolerance !== 'maintenance-window') {
    return {
      primary: 'canary',
      combo: hasServiceMesh ? undefined : undefined,
      confidence: 88,
      reasoning: 'Canary deployment lets you validate changes with a small percentage of real traffic before full rollout. Perfect for high-traffic services where issues affect many users.',
      warnings: hasServiceMesh ? [] : ['Canary works best with a service mesh (Istio/Linkerd) for fine-grained traffic control.'],
    };
  }

  // Recreate for IoT/gaming with maintenance windows or exclusive resources
  if ((industryType === 'iot' || industryType === 'gaming') && (riskTolerance === 'maintenance-window' || isStateful)) {
    return {
      primary: 'recreate',
      combo: 'blue-green',
      confidence: 82,
      reasoning: 'Your workload requires exclusive resource access or cannot run mixed versions. Recreate is the simplest approach for maintenance-window deployments. Wrap with Blue-Green for zero external downtime.',
      warnings: ['Test thoroughly in staging -- Recreate has no safety net if the new version fails.'],
    };
  }

  // Blue-Green for zero-downtime generic
  if (riskTolerance === 'zero-downtime') {
    return {
      primary: 'blue-green',
      confidence: 85,
      reasoning: 'Blue-Green gives you zero-downtime deployments with instant rollback. The trade-off is 2x infrastructure cost during deployment.',
      warnings: ['Requires 2x infrastructure during deployment. Ensure database compatibility across versions.'],
    };
  }

  // Default: Rolling Update
  return {
    primary: 'rolling-update',
    confidence: 75,
    reasoning: 'Rolling Update is the Kubernetes default and works well for most stateless services. It requires no additional tooling and provides zero-downtime updates with gradual pod replacement.',
    warnings: ['Ensure your application can handle mixed-version traffic during the rollout window.'],
  };
}

export function processDeploymentMessage(message: string, state: DeploymentConversationState): DeploymentConversationState {
  const newState = { ...state, answers: { ...state.answers } };

  switch (state.step) {
    case 1: {
      const industryType = extractBestMatch(message, industryKeywords);
      newState.answers.industryType = industryType;
      newState.answers.serviceName = message.trim();
      newState.step = 2;
      break;
    }
    case 2: {
      const riskTolerance = extractBestMatch(message, riskKeywords);
      const deployFrequency = extractBestMatch(message, frequencyKeywords);
      newState.answers.riskTolerance = riskTolerance || 'minimal-downtime';
      newState.answers.deployFrequency = deployFrequency || 'weekly';
      newState.step = 3;
      break;
    }
    case 3: {
      const lower = message.toLowerCase();
      newState.answers.hasSideEffects = lower.includes('email') || lower.includes('payment') || lower.includes('notification') || lower.includes('write') || lower.includes('side effect');
      newState.answers.isStateful = lower.includes('stateful') || lower.includes('database') || lower.includes('session') || lower.includes('state') || lower.includes('gpu');
      newState.step = 4;
      break;
    }
    case 4: {
      const lower = message.toLowerCase();
      newState.answers.needsBusinessMetrics = lower.includes('business') || lower.includes('conversion') || lower.includes('a/b') || lower.includes('experiment') || lower.includes('metrics') || lower.includes('revenue');
      newState.answers.hasServiceMesh = lower.includes('istio') || lower.includes('linkerd') || lower.includes('mesh') || lower.includes('envoy') || lower.includes('yes');
      break;
    }
  }

  return newState;
}

export function getDeploymentStepMessage(state: DeploymentConversationState): AssistantMessage {
  switch (state.step) {
    case 1:
      return {
        role: 'assistant',
        text: "Let's find the right deployment strategy. What industry is your service in, and what does it do? For example: e-commerce checkout, banking API, ML model serving, IoT gateway.",
        suggestions: ['E-commerce / retail', 'Banking / finance', 'SaaS platform', 'ML model serving', 'IoT / edge', 'Gaming'],
      };
    case 2:
      return {
        role: 'assistant',
        text: `Got it -- ${formatIndustry(state.answers.industryType)}. What's your downtime tolerance? And how often do you deploy?`,
        suggestions: ['Zero downtime (mission critical)', 'Brief downtime is OK', 'Maintenance window available', 'We deploy daily via CI/CD'],
      };
    case 3:
      return {
        role: 'assistant',
        text: 'Does your service have side effects (sends emails, processes payments, writes to external APIs)? Is it stateful (uses in-memory sessions, GPU, exclusive resources)?',
        suggestions: ['Stateless, no side effects', 'Has side effects (payments, emails)', 'Stateful (sessions, GPU)', 'Database with schema migrations'],
      };
    case 4: {
      const rec = generateDeploymentRecommendation(state.answers);
      return {
        role: 'assistant',
        text: `Based on your answers, I recommend **${strategyNames[rec.primary] || rec.primary}**${rec.combo ? ` combined with **${strategyNames[rec.combo] || rec.combo}**` : ''}.\n\n${rec.reasoning}${rec.warnings.length > 0 ? '\n\n**Heads up:** ' + rec.warnings.join(' ') : ''}`,
        recommendation: {
          primary: rec.primary,
          secondary: rec.combo,
          confidence: rec.confidence,
          reasoning: rec.reasoning,
          warnings: rec.warnings,
        },
        suggestions: ['Start over'],
      };
    }
    default:
      return {
        role: 'assistant',
        text: "Let's find the right deployment strategy for your workload.",
        suggestions: [],
      };
  }
}
