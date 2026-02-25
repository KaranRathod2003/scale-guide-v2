import React from 'react';
import CopyButton from '@/components/docs/CopyButton';

export interface DeploymentDocPage {
  slug: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

function Callout({ type, children }: { type: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: 'border-blue-500/30 bg-blue-500/5 text-blue-300',
    warning: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
    tip: 'border-brand-400/30 bg-brand-500/5 text-brand-300',
  };
  const labels = { info: 'Info', warning: 'Warning', tip: 'Tip' };
  return (
    <div className={`my-4 rounded-lg border p-4 text-sm ${styles[type]}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider opacity-70">{labels[type]}</span>
      {children}
    </div>
  );
}

function CodeBlock({ language, children }: { language: string; children: string }) {
  return (
    <div className="group relative my-4">
      <div className="flex items-center justify-between rounded-t-lg bg-zinc-700 px-4 py-2">
        <span className="text-xs text-zinc-400">{language}</span>
        <CopyButton text={children} />
      </div>
      <pre className="overflow-x-auto rounded-b-lg bg-zinc-800 p-4 text-sm leading-relaxed text-zinc-200">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function PitfallTable({ pitfalls }: { pitfalls: { pitfall: string; symptom: string; fix: string }[] }) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="px-4 py-3 text-left font-medium text-zinc-300">Pitfall</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-300">Symptom</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-300">Fix</th>
          </tr>
        </thead>
        <tbody>
          {pitfalls.map((p, i) => (
            <tr key={i} className="border-b border-zinc-700/50">
              <td className="px-4 py-3 font-medium text-white">{p.pitfall}</td>
              <td className="px-4 py-3 text-zinc-300">{p.symptom}</td>
              <td className="px-4 py-3 text-zinc-200">{p.fix}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ──────────────────────────────────────────
// BLUE-GREEN DOC
// ──────────────────────────────────────────
const blueGreenContent = (
  <>
    <p className="text-lg text-zinc-200">
      Blue-Green deployment maintains two identical production environments. At any time, only one (say Blue) serves live traffic. You deploy the new version to the idle environment (Green), verify it, then switch the load balancer to route all traffic to Green instantly.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">How It Works</h2>
    <p className="text-zinc-200">
      The key is having two complete, independent environments. A load balancer or DNS sits in front and directs traffic to the active environment. Deployment happens to the inactive environment with zero impact on users. Once validated, the switch is instant -- typically a single load balancer rule change.
    </p>

    <Callout type="info">
      Rollback is equally instant: just switch traffic back to the old environment. This is why Blue-Green is favored in finance and healthcare where rollback speed is critical.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">When to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Zero-downtime deployments are mandatory</li>
      <li>Instant rollback is a regulatory or business requirement</li>
      <li>You can afford 2x infrastructure cost during deployment</li>
      <li>Database schema is backward-compatible across versions</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">When NOT to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Database schema changes that break backward compatibility</li>
      <li>Budget constraints prevent running two full environments</li>
      <li>Very frequent deployments (multiple per hour)</li>
      <li>Stateful apps with in-memory sessions that cannot be shared</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Examples</h2>
    <div className="my-4 space-y-4">
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Capital One - Banking API</h3>
        <p className="text-sm text-zinc-300">
          Capital One uses Blue-Green for their customer-facing banking API. Regulatory requirements demand instant rollback capability. Each deployment is validated in the Green environment with synthetic transactions before switching. Rollback has been exercised in under 30 seconds.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Transport for London - Fare Engine</h3>
        <p className="text-sm text-zinc-300">
          TfL updates the fare calculation engine using Blue-Green to ensure zero disruption during peak commuting hours. The Green environment is validated with millions of fare calculations before traffic switch. Inconsistent fares would cause public trust issues.
        </p>
      </div>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Step-by-Step Implementation</h2>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">1. Define two Services for Blue and Green</h3>
    <CodeBlock language="yaml">{`apiVersion: v1
kind: Service
metadata:
  name: app-blue
spec:
  selector:
    app: myapp
    version: blue
  ports:
  - port: 80
    targetPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: app-green
spec:
  selector:
    app: myapp
    version: green
  ports:
  - port: 80
    targetPort: 8080`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">2. Deploy new version to Green</h3>
    <CodeBlock language="yaml">{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
      - name: myapp
        image: myregistry/myapp:2.0.0
        ports:
        - containerPort: 8080
        readinessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 5`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">3. Switch traffic via Ingress</h3>
    <CodeBlock language="yaml">{`apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-green  # Switch from app-blue to app-green
            port:
              number: 80`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">4. Verify and roll back if needed</h3>
    <CodeBlock language="bash">{`# Verify Green is healthy
kubectl get pods -l version=green

# If issues arise, switch back to Blue
kubectl patch ingress myapp-ingress --type='json' \\
  -p='[{"op": "replace", "path": "/spec/rules/0/http/paths/0/backend/service/name", "value": "app-blue"}]'`}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Common Pitfalls</h2>
    <PitfallTable pitfalls={[
      { pitfall: 'Database schema divergence', symptom: 'Rollback fails because Green schema is incompatible with Blue code', fix: 'Use expand-and-contract migrations; keep schemas backward-compatible' },
      { pitfall: 'Session state loss', symptom: 'Users logged out after switch', fix: 'Use external session store (Redis) shared between environments' },
      { pitfall: 'DNS propagation delay', symptom: 'Some users still hitting old environment', fix: 'Use load balancer switching instead of DNS; or set low TTL' },
      { pitfall: 'Forgetting to warm up Green', symptom: 'High latency immediately after switch', fix: 'Run load tests against Green before switching traffic' },
    ]} />
  </>
);

// ──────────────────────────────────────────
// CANARY DOC
// ──────────────────────────────────────────
const canaryContent = (
  <>
    <p className="text-lg text-zinc-200">
      Canary deployment routes a small percentage (1-10%) of traffic to the new version while the majority continues on the stable version. You gradually increase traffic to the canary if metrics are healthy, eventually replacing the old version entirely.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">How It Works</h2>
    <p className="text-zinc-200">
      A canary is deployed alongside production pods. Traffic splitting is managed by a service mesh (Istio, Linkerd) or ingress controller (NGINX, Traefik). Automated or manual gates check error rates, latency, and business metrics at each stage. If any threshold is breached, traffic is instantly routed back to the stable version.
    </p>

    <Callout type="tip">
      The name comes from &quot;canary in a coal mine&quot; -- if the canary (small deployment) dies, you know not to send more traffic. It&apos;s the safest way to validate changes with real production traffic.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">When to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>High-traffic services where issues affect millions of users</li>
      <li>You have observability (metrics, tracing, logging) in place</li>
      <li>Changes could have subtle, hard-to-test impacts</li>
      <li>Gradual rollout provides time to catch edge cases</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">When NOT to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Low-traffic services (not enough signal for metrics)</li>
      <li>No monitoring or alerting infrastructure</li>
      <li>You need a fast iteration cycle with many deploys per day</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Examples</h2>
    <div className="my-4 space-y-4">
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Facebook - News Feed Ranking</h3>
        <p className="text-sm text-zinc-300">
          Facebook rolls out News Feed ranking changes to 1% of users first, monitors engagement metrics for 36 hours, then gradually expands. A single ranking change can affect billions of views per day, making canary deployment essential.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Netflix - Recommendation Engine</h3>
        <p className="text-sm text-zinc-300">
          Netflix validates recommendation algorithm updates with a 2% canary. They monitor click-through rate, play rate, and member satisfaction score. The canary runs for 24-48 hours before being promoted or rolled back.
        </p>
      </div>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Step-by-Step Implementation (Istio)</h2>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">1. Deploy canary alongside stable</h3>
    <CodeBlock language="yaml">{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
      version: canary
  template:
    metadata:
      labels:
        app: myapp
        version: canary
    spec:
      containers:
      - name: myapp
        image: myregistry/myapp:2.0.0-canary`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">2. Configure traffic split with Istio VirtualService</h3>
    <CodeBlock language="yaml">{`apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: myapp-vs
spec:
  hosts:
  - myapp
  http:
  - route:
    - destination:
        host: myapp
        subset: stable
      weight: 95
    - destination:
        host: myapp
        subset: canary
      weight: 5     # 5% canary traffic`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">3. Gradually increase canary weight</h3>
    <CodeBlock language="bash">{`# Monitor error rate
kubectl exec -it $(kubectl get pod -l app=prometheus -o name) -- \\
  promtool query instant 'rate(http_requests_total{version="canary",code=~"5.."}[5m])'

# If healthy, increase to 25%
kubectl apply -f virtualservice-25-percent.yaml

# Continue: 50% → 75% → 100%`}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Common Pitfalls</h2>
    <PitfallTable pitfalls={[
      { pitfall: 'Insufficient traffic to canary', symptom: 'Metrics are statistically insignificant', fix: 'Ensure canary gets enough traffic; increase percentage or wait longer' },
      { pitfall: 'No automated rollback', symptom: 'Bad canary runs too long, affecting users', fix: 'Use Flagger or Argo Rollouts for automated canary analysis' },
      { pitfall: 'Sticky sessions bypass canary', symptom: 'Some users never hit canary', fix: 'Configure session affinity at the canary routing level' },
      { pitfall: 'Monitoring wrong metrics', symptom: 'Canary promoted despite degraded UX', fix: 'Monitor business metrics (conversion, engagement) not just error rates' },
    ]} />
  </>
);

// ──────────────────────────────────────────
// ROLLING UPDATE DOC
// ──────────────────────────────────────────
const rollingUpdateContent = (
  <>
    <p className="text-lg text-zinc-200">
      Rolling Update is the Kubernetes default deployment strategy. It replaces old pods with new pods incrementally, ensuring some pods are always available to serve traffic. No additional infrastructure is needed.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">How It Works</h2>
    <p className="text-zinc-200">
      Kubernetes creates a new ReplicaSet with the updated pod spec and gradually scales it up while scaling down the old ReplicaSet. Two parameters control the pace: <code className="text-brand-300">maxSurge</code> (how many extra pods can exist) and <code className="text-brand-300">maxUnavailable</code> (how many pods can be down during update). Readiness probes ensure new pods are healthy before old ones are terminated.
    </p>

    <Callout type="info">
      During a rolling update, both old and new versions serve traffic simultaneously. Your application must handle this mixed-version state gracefully (backward-compatible APIs, shared data formats).
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">When to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Stateless microservices and APIs</li>
      <li>Changes are backward-compatible</li>
      <li>You want the simplest zero-downtime deployment</li>
      <li>Standard CI/CD pipelines</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">When NOT to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Breaking API changes between versions</li>
      <li>Database schema migrations that break backward compatibility</li>
      <li>You need an atomic all-or-nothing switch</li>
      <li>Real-time systems where mixed versions cause inconsistency</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Examples</h2>
    <div className="my-4 space-y-4">
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Walmart - Product Catalog API</h3>
        <p className="text-sm text-zinc-300">
          Walmart deploys product catalog updates across 200+ pods using rolling updates during business hours. maxSurge=25% and maxUnavailable=0 ensures no capacity loss. Readiness probes validate each pod can query the catalog database before receiving traffic.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Target - Price Update Service</h3>
        <p className="text-sm text-zinc-300">
          Target rolls out price service updates with maxSurge=1 to ensure consistent pricing. Each pod is validated with readiness probes that check price calculation accuracy before receiving traffic.
        </p>
      </div>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Step-by-Step Implementation</h2>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">1. Configure rolling update strategy</h3>
    <CodeBlock language="yaml">{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-catalog
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # 1 extra pod during update
      maxUnavailable: 0    # Never reduce capacity
  selector:
    matchLabels:
      app: product-catalog
  template:
    metadata:
      labels:
        app: product-catalog
    spec:
      containers:
      - name: catalog
        image: myregistry/catalog:2.0.0
        ports:
        - containerPort: 8080
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">2. Apply and monitor rollout</h3>
    <CodeBlock language="bash">{`kubectl apply -f deployment.yaml
kubectl rollout status deployment/product-catalog
kubectl get rs -l app=product-catalog  # See old and new ReplicaSets`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">3. Rollback if needed</h3>
    <CodeBlock language="bash">{`kubectl rollout undo deployment/product-catalog
kubectl rollout history deployment/product-catalog`}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Common Pitfalls</h2>
    <PitfallTable pitfalls={[
      { pitfall: 'No readiness probe', symptom: 'Traffic routed to unready pods, causing errors', fix: 'Always define readinessProbe for every container' },
      { pitfall: 'API version incompatibility', symptom: 'Errors during mixed-version window', fix: 'Ensure backward compatibility; use API versioning' },
      { pitfall: 'maxUnavailable too high', symptom: 'Capacity drops below acceptable level', fix: 'Set maxUnavailable: 0 for critical services' },
      { pitfall: 'Slow readiness probes', symptom: 'Rollout takes too long', fix: 'Optimize startup time; use startupProbe for slow-starting apps' },
    ]} />
  </>
);

// ──────────────────────────────────────────
// RECREATE DOC
// ──────────────────────────────────────────
const recreateContent = (
  <>
    <p className="text-lg text-zinc-200">
      Recreate deployment terminates all existing pods before creating new ones. It is the simplest strategy but causes brief downtime. It is the right choice when two versions of your application absolutely cannot coexist.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">How It Works</h2>
    <p className="text-zinc-200">
      When you set <code className="text-brand-300">strategy.type: Recreate</code>, Kubernetes scales the old ReplicaSet to 0, waits for all pods to terminate, then creates the new ReplicaSet. There is a gap where no pods are running. The duration depends on termination grace period + new pod startup time.
    </p>

    <Callout type="warning">
      Recreate causes downtime. Only use it when running two versions simultaneously would cause worse problems than brief unavailability (e.g., exclusive hardware access, database lock contention, or incompatible schema changes).
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">When to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>GPU workloads requiring exclusive device access</li>
      <li>Legacy monoliths that cannot run in mixed-version state</li>
      <li>Database schema migrations that break old version</li>
      <li>Embedded/IoT edge deployments with limited resources</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">When NOT to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Customer-facing services with SLA requirements</li>
      <li>Any service where downtime is unacceptable</li>
      <li>Frequent deployments (each one causes an outage)</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Examples</h2>
    <div className="my-4 space-y-4">
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Siemens - IoT Edge Gateways</h3>
        <p className="text-sm text-zinc-300">
          Siemens IoT edge gateways require exclusive access to serial port hardware. Running two versions simultaneously would cause device contention. Recreate strategy during scheduled maintenance windows ensures clean hardware handoff.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Riot Games - Match History Service</h3>
        <p className="text-sm text-zinc-300">
          Riot Games deploys match history database schema updates during off-peak hours (3-4 AM). The Recreate strategy ensures no pod tries to read a half-migrated schema. Planned 60-second downtime is communicated via status page.
        </p>
      </div>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Step-by-Step Implementation</h2>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">1. Set Recreate strategy</h3>
    <CodeBlock language="yaml">{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: edge-gateway
spec:
  replicas: 3
  strategy:
    type: Recreate    # No rolling - kill all, then create all
  selector:
    matchLabels:
      app: edge-gateway
  template:
    metadata:
      labels:
        app: edge-gateway
    spec:
      terminationGracePeriodSeconds: 30
      containers:
      - name: gateway
        image: myregistry/gateway:2.0.0
        resources:
          limits:
            nvidia.com/gpu: 1
        readinessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 10`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">2. Apply during maintenance window</h3>
    <CodeBlock language="bash">{`# Announce downtime
echo "Starting maintenance window..."

# Apply - all old pods terminate, then new ones start
kubectl apply -f deployment.yaml

# Watch the gap
kubectl get pods -l app=edge-gateway -w`}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Common Pitfalls</h2>
    <PitfallTable pitfalls={[
      { pitfall: 'CrashLoopBackOff on new version', symptom: 'All pods are down with no way to serve traffic', fix: 'Test thoroughly in staging; have rollback plan ready before deploying' },
      { pitfall: 'Long termination grace period', symptom: 'Downtime window longer than expected', fix: 'Tune terminationGracePeriodSeconds; implement graceful shutdown' },
      { pitfall: 'No health checks on new pods', symptom: 'Service appears up but is not ready', fix: 'Always set readinessProbe; use startupProbe for slow apps' },
      { pitfall: 'Deploying during peak hours', symptom: 'User impact from unplanned downtime', fix: 'Schedule Recreate deployments during maintenance windows' },
    ]} />
  </>
);

// ──────────────────────────────────────────
// A/B TESTING DOC
// ──────────────────────────────────────────
const abTestingContent = (
  <>
    <p className="text-lg text-zinc-200">
      A/B Testing deployment routes specific user segments to different application versions to measure business impact. Unlike canary (which validates technical health), A/B testing measures user behavior: conversion rates, engagement, revenue.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">How It Works</h2>
    <p className="text-zinc-200">
      Traffic routing is based on user attributes (geography, device, user ID hash, cookie) rather than random percentage. Both versions run simultaneously, each instrumented with analytics. After enough data is collected for statistical significance, the winning version is promoted.
    </p>

    <Callout type="tip">
      A/B testing is a deployment strategy and a product methodology. It requires coordination between engineering (traffic routing), data science (experiment design), and product (success metrics). The technical deployment is just one piece.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">When to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>UI/UX changes where business metrics matter more than error rates</li>
      <li>Pricing or checkout flow experiments</li>
      <li>Feature launches where user reception is uncertain</li>
      <li>You have an analytics platform for experiment analysis</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">When NOT to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Backend infrastructure changes with no user-facing impact</li>
      <li>Bug fixes (just deploy them)</li>
      <li>You lack analytics infrastructure for measuring outcomes</li>
      <li>Legal/compliance changes that must apply to all users</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Examples</h2>
    <div className="my-4 space-y-4">
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Amazon - Checkout Button Placement</h3>
        <p className="text-sm text-zinc-300">
          Amazon tested checkout button placement across 50 million users. Version A had the button above the fold, Version B below. The A/B test ran for 2 weeks and found a 3.2% conversion lift with the above-fold placement, translating to hundreds of millions in additional revenue.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Uber - Surge Pricing Display</h3>
        <p className="text-sm text-zinc-300">
          Uber A/B tested surge pricing display formats: multiplier (2.3x) vs. flat fare estimate ($34.50). The flat fare format showed 18% higher ride acceptance rates, leading to a global rollout.
        </p>
      </div>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Step-by-Step Implementation</h2>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">1. Deploy both versions with distinct labels</h3>
    <CodeBlock language="yaml">{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkout-v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: checkout
      version: v1
  template:
    metadata:
      labels:
        app: checkout
        version: v1
    spec:
      containers:
      - name: checkout
        image: myregistry/checkout:1.0.0
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkout-v2
spec:
  replicas: 3
  selector:
    matchLabels:
      app: checkout
      version: v2
  template:
    metadata:
      labels:
        app: checkout
        version: v2
    spec:
      containers:
      - name: checkout
        image: myregistry/checkout:2.0.0-experiment`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">2. Route by header or cookie (NGINX Ingress)</h3>
    <CodeBlock language="yaml">{`apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: checkout-ab
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-header: "X-User-Group"
    nginx.ingress.kubernetes.io/canary-by-header-value: "experiment"
spec:
  rules:
  - host: checkout.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: checkout-v2
            port:
              number: 80`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">3. Analyze results</h3>
    <CodeBlock language="bash">{`# Check sample sizes and statistical significance
# Typically done through analytics platform (Amplitude, Mixpanel, etc.)

# Once experiment concludes, promote winner
kubectl scale deployment checkout-v1 --replicas=0
kubectl scale deployment checkout-v2 --replicas=6`}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Common Pitfalls</h2>
    <PitfallTable pitfalls={[
      { pitfall: 'Insufficient sample size', symptom: 'Results are not statistically significant', fix: 'Calculate required sample size before starting; run longer if needed' },
      { pitfall: 'User experience leakage', symptom: 'Users see both versions across sessions', fix: 'Ensure sticky routing via cookies or user ID hash' },
      { pitfall: 'Too many concurrent experiments', symptom: 'Confounding variables, unreliable results', fix: 'Limit overlapping experiments; use proper experiment framework' },
      { pitfall: 'Ignoring segment bias', symptom: 'Results skewed by non-representative segments', fix: 'Randomize user assignment; validate segment demographics match' },
    ]} />
  </>
);

// ──────────────────────────────────────────
// SHADOW DOC
// ──────────────────────────────────────────
const shadowContent = (
  <>
    <p className="text-lg text-zinc-200">
      Shadow (Dark) deployment mirrors live production traffic to a new version running in parallel. The shadow version processes real requests but its responses are discarded -- users always get responses from the production version. This provides zero-risk validation with real-world data.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">How It Works</h2>
    <p className="text-zinc-200">
      A service mesh or proxy (Istio, Envoy) duplicates incoming requests and sends them to both production and the shadow version. Production responses go to users; shadow responses are logged and compared. You can diff response bodies, compare latency, and validate correctness without any user impact.
    </p>

    <Callout type="warning">
      The shadow version must NOT write to shared databases, send emails, charge credit cards, or trigger any external side effects. Isolate all write operations to prevent data contamination.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">When to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>ML model updates (compare prediction quality)</li>
      <li>Search ranking algorithm changes</li>
      <li>Financial calculation engine updates</li>
      <li>Performance benchmarking with real traffic patterns</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">When NOT to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Write-heavy services (risk of duplicate writes)</li>
      <li>Services that trigger external side effects (email, SMS, payments)</li>
      <li>Budget constraints (requires 2x compute for shadow)</li>
      <li>Simple CRUD applications where shadow adds no value</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Examples</h2>
    <div className="my-4 space-y-4">
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Google - Search Ranking Algorithms</h3>
        <p className="text-sm text-zinc-300">
          Google shadow-tests search ranking changes by running new algorithms against live queries. Shadow results are compared against production results for relevance scoring. This runs for 2+ weeks before any algorithm change reaches real users.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-700 bg-surface-raised p-5">
        <h3 className="mb-2 font-semibold text-brand-400">Delta Airlines - Dynamic Pricing</h3>
        <p className="text-sm text-zinc-300">
          Delta shadow-tested a new dynamic pricing model for 3 weeks. Real fare requests were mirrored to the new model, and prices were compared. The shadow model showed 4% revenue improvement with no increase in booking abandonment, validating the change before going live.
        </p>
      </div>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Step-by-Step Implementation (Istio)</h2>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">1. Deploy shadow version</h3>
    <CodeBlock language="yaml">{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: pricing-shadow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pricing
      version: shadow
  template:
    metadata:
      labels:
        app: pricing
        version: shadow
    spec:
      containers:
      - name: pricing
        image: myregistry/pricing:2.0.0-shadow
        env:
        - name: SHADOW_MODE
          value: "true"    # Disable writes to external systems`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">2. Configure traffic mirroring with Istio</h3>
    <CodeBlock language="yaml">{`apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: pricing-vs
spec:
  hosts:
  - pricing
  http:
  - route:
    - destination:
        host: pricing
        subset: production
      weight: 100
    mirror:
      host: pricing
      subset: shadow
    mirrorPercentage:
      value: 100.0   # Mirror 100% of traffic`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">3. Compare responses</h3>
    <CodeBlock language="bash">{`# Diff shadow vs production responses
# Log shadow responses and compare with production output
kubectl logs -l version=shadow --tail=100

# Check shadow error rates independently
# Shadow errors do NOT affect users but indicate issues with new version`}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Common Pitfalls</h2>
    <PitfallTable pitfalls={[
      { pitfall: 'Shadow writes to shared DB', symptom: 'Duplicate records, corrupted data', fix: 'Use SHADOW_MODE env var to disable all write operations' },
      { pitfall: 'Shadow triggers side effects', symptom: 'Duplicate emails, double charges', fix: 'Mock or disable all external API calls in shadow mode' },
      { pitfall: 'Shadow impacts production perf', symptom: 'Increased latency on production', fix: 'Ensure shadow runs on separate resources; use async mirroring' },
      { pitfall: '2x infrastructure cost', symptom: 'Higher cloud bill than expected', fix: 'Mirror only a percentage of traffic; use spot instances for shadow' },
    ]} />
  </>
);

// ──────────────────────────────────────────
// EXPORT ALL DEPLOYMENT DOCS
// ──────────────────────────────────────────
export const deploymentDocs: DeploymentDocPage[] = [
  {
    slug: 'blue-green',
    title: 'Blue-Green Deployment',
    description: 'Two identical environments with instant traffic switch for zero-downtime deployments.',
    content: blueGreenContent,
  },
  {
    slug: 'canary',
    title: 'Canary Deployment',
    description: 'Gradually route traffic to a new version while monitoring for issues.',
    content: canaryContent,
  },
  {
    slug: 'rolling-update',
    title: 'Rolling Update',
    description: 'The Kubernetes default: replace pods one at a time with zero downtime.',
    content: rollingUpdateContent,
  },
  {
    slug: 'recreate',
    title: 'Recreate Deployment',
    description: 'Terminate all old pods then start new pods. Simple but causes brief downtime.',
    content: recreateContent,
  },
  {
    slug: 'ab-testing',
    title: 'A/B Testing Deployment',
    description: 'Route user segments to different versions to measure business impact.',
    content: abTestingContent,
  },
  {
    slug: 'shadow',
    title: 'Shadow (Dark) Deployment',
    description: 'Mirror traffic to a new version for zero-risk validation. Responses discarded.',
    content: shadowContent,
  },
];

export function getDeploymentDocBySlug(slug: string): DeploymentDocPage | undefined {
  return deploymentDocs.find((d) => d.slug === slug);
}

export function getAllDeploymentDocSlugs(): string[] {
  return deploymentDocs.map((d) => d.slug);
}
