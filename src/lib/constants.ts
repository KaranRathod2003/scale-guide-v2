export const SITE_NAME = 'ScaleGuide';
export const SITE_DESCRIPTION = 'Complex engineering topics made simple. Real-world examples, interactive playgrounds, and AI-guided recommendations for autoscaling, deployment strategies, databases, and more.';

export const TOPICS = [
  {
    label: 'Autoscaling',
    items: [
      { label: 'Deep Dive', href: '/docs', description: 'HPA, VPA, Cluster Autoscaler, KEDA' },
      { label: 'Playground', href: '/visualize', description: 'Interactive scaling simulations' },
    ],
  },
  {
    label: 'Deployments',
    items: [
      { label: 'Deep Dive', href: '/deployment-strategies', description: 'Blue-Green, Canary, Rolling, and more' },
      { label: 'Playground', href: '/deployment-strategies/visualize', description: 'Watch deployments in action' },
    ],
  },
  {
    label: 'PostgreSQL',
    items: [
      { label: 'Deep Dive', href: '/postgresql', description: 'Setup, connections, practice exercises' },
      { label: 'Playground', href: '/postgresql/visualize', description: 'Interactive connection simulator' },
    ],
  },
  {
    label: 'News',
    items: [
      { label: 'Live Feed', href: '/news', description: 'Latest on scaling, deployments, and PostgreSQL' },
    ],
  },
  {
    label: 'Sandbox',
    items: [
      { label: 'Code Playground', href: '/playground', description: 'Write SQL, K8s manifests, and deploy configs' },
    ],
  },
] as const;

export const PLAYGROUND_NAV = {
  title: 'Code Sandbox',
  items: [
    { slug: 'sql', title: 'SQL Queries', shortTitle: 'SQL' },
    { slug: 'k8s', title: 'K8s Manifests', shortTitle: 'K8s' },
    { slug: 'deployment', title: 'Deploy Configs', shortTitle: 'Deploy' },
  ],
} as const;

export const DOC_NAV = {
  title: 'Autoscaling',
  items: [
    { slug: 'hpa', title: 'Horizontal Pod Autoscaler', shortTitle: 'HPA' },
    { slug: 'vpa', title: 'Vertical Pod Autoscaler', shortTitle: 'VPA' },
    { slug: 'cluster-autoscaler', title: 'Cluster Autoscaler', shortTitle: 'Cluster' },
    { slug: 'keda', title: 'KEDA', shortTitle: 'KEDA' },
  ],
} as const;

export const DEPLOYMENT_NAV = {
  title: 'Deployment Strategies',
  items: [
    { slug: 'blue-green', title: 'Blue-Green Deployment', shortTitle: 'Blue-Green' },
    { slug: 'canary', title: 'Canary Deployment', shortTitle: 'Canary' },
    { slug: 'rolling-update', title: 'Rolling Update', shortTitle: 'Rolling' },
    { slug: 'recreate', title: 'Recreate Deployment', shortTitle: 'Recreate' },
    { slug: 'ab-testing', title: 'A/B Testing Deployment', shortTitle: 'A/B Testing' },
    { slug: 'shadow', title: 'Shadow (Dark) Deployment', shortTitle: 'Shadow' },
  ],
} as const;

export const POSTGRESQL_NAV = {
  title: 'PostgreSQL',
  items: [
    { slug: 'prerequisites-setup', title: 'Prerequisites & Setup', shortTitle: 'Setup' },
    { slug: 'why-postgresql', title: 'Why PostgreSQL?', shortTitle: 'Why PG' },
    { slug: 'backend-connections', title: 'Backend Connections', shortTitle: 'Connections' },
    { slug: 'practice-examples', title: 'Practice Examples', shortTitle: 'Practice' },
    { slug: 'official-docs-summary', title: 'Official Docs Summary', shortTitle: 'Docs Summary' },
  ],
} as const;
