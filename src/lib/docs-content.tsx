import React from 'react';
import CopyButton from '@/components/docs/CopyButton';

export interface DocPage {
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
// HPA DOC
// ──────────────────────────────────────────
const hpaContent = (
  <>
    <p className="text-lg text-zinc-200">
      The Horizontal Pod Autoscaler (HPA) automatically adjusts the number of pod replicas in a Deployment based on observed metrics like CPU utilization, memory, or custom metrics. It is the most commonly used autoscaler in Kubernetes.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">How It Works</h2>
    <p className="text-zinc-200">
      HPA runs a control loop every 15 seconds (configurable). It queries the Metrics Server for current utilization, calculates the desired replica count using the formula:
    </p>
    <CodeBlock language="text">{`desiredReplicas = ceil(currentReplicas * (currentMetricValue / targetMetricValue))

Example: 3 replicas at 80% CPU, target 50%
= ceil(3 * (80 / 50)) = ceil(4.8) = 5 replicas`}</CodeBlock>
    <p className="text-zinc-200">
      The HPA then updates the replica count on the target Deployment. A stabilization window (5 min for scale-down by default) prevents rapid flapping.
    </p>

    <Callout type="info">
      Every container must have <code className="text-blue-300">resources.requests</code> defined for the metrics being tracked, otherwise HPA will show &lt;unknown&gt;.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">When to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Stateless web apps, REST APIs, microservices</li>
      <li>Load correlates with CPU, memory, or request rate</li>
      <li>Variable or unpredictable traffic patterns</li>
      <li>You need fast scale-out (seconds to minutes)</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">When NOT to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Singleton workloads that can&apos;t run multiple replicas</li>
      <li>Databases or stateful workloads (use VPA)</li>
      <li>You need scale-to-zero (use KEDA)</li>
      <li>I/O-bound workloads where CPU doesn&apos;t reflect load</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Example</h2>
    <div className="my-4 rounded-xl border border-zinc-700 bg-surface-raised p-5">
      <h3 className="mb-2 font-semibold text-brand-400">Netflix-style Streaming Service</h3>
      <p className="text-sm text-zinc-300">
        A video transcoding service scales from 25 to 250 pods during peak evening hours based on a custom metric <code className="text-brand-300">active_streams_per_pod</code>. When the average exceeds 200 streams per pod, HPA triggers. The stabilization window ensures gradual scale-down after midnight, preventing premature termination of active streams.
      </p>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Step-by-Step Implementation</h2>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">1. Ensure Metrics Server is installed</h3>
    <CodeBlock language="bash">{`# Check if metrics-server is running
kubectl get deployment metrics-server -n kube-system

# If not installed
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">2. Deploy with resource requests</h3>
    <CodeBlock language="yaml">{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-api
  template:
    metadata:
      labels:
        app: web-api
    spec:
      containers:
      - name: web-api
        image: myregistry/web-api:1.4.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "250m"       # REQUIRED for HPA
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">3. Create the HPA</h3>
    <CodeBlock language="yaml">{`apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-api
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 25
        periodSeconds: 60`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">4. Verify</h3>
    <CodeBlock language="bash">{`kubectl apply -f hpa.yaml
kubectl get hpa web-api-hpa --watch
kubectl describe hpa web-api-hpa`}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Common Pitfalls</h2>
    <PitfallTable pitfalls={[
      { pitfall: 'Missing resource requests', symptom: 'HPA shows <unknown> for metrics', fix: 'Add resources.requests.cpu to every container' },
      { pitfall: 'Metrics Server not installed', symptom: '"unable to get metrics" error', fix: 'Install Metrics Server in kube-system' },
      { pitfall: 'Pod flapping', symptom: 'Replicas oscillate rapidly', fix: 'Add stabilizationWindowSeconds to behavior' },
      { pitfall: 'Memory as primary metric', symptom: 'Unnecessary scaling (GC behavior)', fix: 'Use CPU or custom metrics as primary' },
      { pitfall: 'Insufficient cluster capacity', symptom: 'New pods stuck in Pending', fix: 'Pair with Cluster Autoscaler' },
    ]} />
  </>
);

// ──────────────────────────────────────────
// VPA DOC
// ──────────────────────────────────────────
const vpaContent = (
  <>
    <p className="text-lg text-zinc-200">
      The Vertical Pod Autoscaler (VPA) automatically adjusts CPU and memory resource requests for containers based on historical and real-time usage. It makes pods &quot;bigger&quot; or &quot;smaller&quot; instead of adding more replicas.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">How It Works</h2>
    <p className="text-zinc-200">
      VPA consists of three components: the <strong className="text-white">Recommender</strong> (monitors usage and computes optimal values), the <strong className="text-white">Updater</strong> (evicts pods when recommendations diverge significantly), and the <strong className="text-white">Admission Controller</strong> (mutates pod specs on creation with recommended values).
    </p>
    <p className="mt-3 text-zinc-200">
      Update modes: <code className="text-brand-300">Off</code> (recommendations only), <code className="text-brand-300">Initial</code> (sets at creation only), <code className="text-brand-300">Recreate</code> (evicts and recreates pods), <code className="text-brand-300">Auto</code> (currently same as Recreate).
    </p>

    <Callout type="warning">
      VPA may restart pods to apply new resource values. Ensure your application handles restarts gracefully. Never run VPA and HPA on the same CPU/memory metric.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">When to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Databases, caches, stateful singletons</li>
      <li>You don&apos;t know the correct resource requests</li>
      <li>Right-sizing over-provisioned pods to save costs</li>
      <li>Workloads with varying resource needs over time</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">When NOT to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Stateless apps that can scale horizontally (use HPA)</li>
      <li>Disruption-intolerant workloads</li>
      <li>Already using HPA on CPU/memory (they conflict)</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Example</h2>
    <div className="my-4 rounded-xl border border-zinc-700 bg-surface-raised p-5">
      <h3 className="mb-2 font-semibold text-brand-400">PostgreSQL Batch Processing</h3>
      <p className="text-sm text-zinc-300">
        A PostgreSQL pod needs 500m CPU during the day for OLTP queries but 2 CPU at night for ETL batch jobs. VPA automatically adjusts resource requests based on observed patterns, eliminating the need to over-provision for peak (saving 75% of daytime resources).
      </p>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Step-by-Step Implementation</h2>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">1. Install VPA</h3>
    <CodeBlock language="bash">{`git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler
./hack/vpa-up.sh

# Verify
kubectl get pods -n kube-system | grep vpa`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">2. Start with recommendation-only mode</h3>
    <CodeBlock language="yaml">{`apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: postgres-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: postgres
  updatePolicy:
    updateMode: "Off"   # Recommendation only`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">3. Enable auto-updates with bounds</h3>
    <CodeBlock language="yaml">{`apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: postgres-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: postgres
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: postgres
      minAllowed:
        cpu: "250m"
        memory: "512Mi"
      maxAllowed:
        cpu: "4"
        memory: "8Gi"
      controlledResources: ["cpu", "memory"]`}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Common Pitfalls</h2>
    <PitfallTable pitfalls={[
      { pitfall: 'Pod eviction disruptions', symptom: 'Pods restart unexpectedly', fix: 'Use "Off" mode initially; set PodDisruptionBudget' },
      { pitfall: 'Conflicting with HPA', symptom: 'Oscillating behavior', fix: 'Never run both on CPU/memory for the same deployment' },
      { pitfall: 'No minAllowed set', symptom: 'VPA recommends tiny resources', fix: 'Always set minAllowed in resourcePolicy' },
      { pitfall: 'Slow to converge', symptom: 'Inaccurate recommendations', fix: 'Let VPA observe for 24-48 hours before enabling Auto' },
    ]} />
  </>
);

// ──────────────────────────────────────────
// CLUSTER AUTOSCALER DOC
// ──────────────────────────────────────────
const clusterAutoscalerContent = (
  <>
    <p className="text-lg text-zinc-200">
      The Cluster Autoscaler adjusts the number of nodes in your cluster. It adds nodes when pods can&apos;t be scheduled (pending) and removes underutilized nodes whose pods can be rescheduled elsewhere.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">How It Works</h2>
    <p className="text-zinc-200">
      The Cluster Autoscaler scans every 10 seconds. For <strong className="text-white">scale-up</strong>: it detects pods in Pending state, evaluates which node group can satisfy requirements, and calls the cloud provider API to provision new VMs. For <strong className="text-white">scale-down</strong>: it checks if nodes are below 50% utilization for 10+ minutes and safely drains them.
    </p>
    <p className="mt-3 text-zinc-200">
      It uses an <strong className="text-white">expander strategy</strong> to choose which node group to scale: <code className="text-brand-300">least-waste</code> (recommended), <code className="text-brand-300">most-pods</code>, <code className="text-brand-300">random</code>, or <code className="text-brand-300">priority</code>.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">When to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Pod autoscalers (HPA/KEDA) create more pods than nodes can handle</li>
      <li>You want automatic infrastructure elasticity</li>
      <li>Significant load variance (daily cycles, seasonal spikes)</li>
      <li>Cost optimization by removing idle nodes</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">When NOT to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Bare metal clusters (no dynamic node provisioning)</li>
      <li>Latency-sensitive workloads (2-5 min node provisioning)</li>
      <li>Fixed-capacity requirements or compliance constraints</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Example</h2>
    <div className="my-4 rounded-xl border border-zinc-700 bg-surface-raised p-5">
      <h3 className="mb-2 font-semibold text-brand-400">Black Friday Traffic Spike</h3>
      <p className="text-sm text-zinc-300">
        An e-commerce platform runs on 20 nodes normally. On Black Friday, HPA scales the frontend from 40 to 600 pods. The Cluster Autoscaler detects hundreds of Pending pods, provisions 65 additional c5.2xlarge EC2 instances over 12 minutes (20 → 85 nodes). By Monday, traffic normalizes and nodes are gradually drained back to 20.
      </p>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Step-by-Step Implementation (AWS EKS)</h2>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">1. Configure node group</h3>
    <CodeBlock language="bash">{`aws eks create-nodegroup \\
  --cluster-name my-cluster \\
  --nodegroup-name standard-workers \\
  --instance-types c5.2xlarge \\
  --scaling-config minSize=2,maxSize=100,desiredSize=5`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">2. Deploy via Helm</h3>
    <CodeBlock language="bash">{`helm repo add autoscaler https://kubernetes.github.io/autoscaler
helm install cluster-autoscaler autoscaler/cluster-autoscaler \\
  --namespace kube-system \\
  --set autoDiscovery.clusterName=my-cluster \\
  --set awsRegion=us-east-1 \\
  --set extraArgs.expander=least-waste \\
  --set extraArgs.scale-down-unneeded-time=10m \\
  --set extraArgs.scale-down-utilization-threshold=0.5`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">3. Verify</h3>
    <CodeBlock language="bash">{`kubectl logs -n kube-system -l app=cluster-autoscaler --tail=50
kubectl get nodes --watch`}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Common Pitfalls</h2>
    <PitfallTable pitfalls={[
      { pitfall: 'Node provisioning too slow', symptom: 'Pods Pending for 3-5+ min', fix: 'Use Karpenter for faster provisioning; or maintain warm spare nodes' },
      { pitfall: 'Nodes not scaling down', symptom: 'Idle nodes remain', fix: 'Check for pods with local storage or restrictive PDBs' },
      { pitfall: 'IAM / permissions errors', symptom: 'AccessDenied in CA logs', fix: 'Ensure service account has autoscaling:* and ec2:Describe* permissions' },
      { pitfall: 'PDB blocking scale-down', symptom: 'CA refuses to evict pods', fix: 'Ensure PDBs allow at least 1 pod eviction' },
    ]} />
  </>
);

// ──────────────────────────────────────────
// KEDA DOC
// ──────────────────────────────────────────
const kedaContent = (
  <>
    <p className="text-lg text-zinc-200">
      KEDA (Kubernetes Event-Driven Autoscaler) extends Kubernetes autoscaling beyond CPU and memory. It scales workloads based on external event sources like queue depth, stream lag, cron schedules, and 70+ other triggers. It uniquely supports scaling to zero.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">How It Works</h2>
    <p className="text-zinc-200">
      KEDA installs three components: the <strong className="text-white">Operator</strong> (watches ScaledObject CRDs and creates HPAs), the <strong className="text-white">Metrics Server</strong> (exposes external metrics to HPA), and <strong className="text-white">Admission Webhooks</strong> (validates configurations).
    </p>
    <p className="mt-3 text-zinc-200">
      When you create a <code className="text-brand-300">ScaledObject</code>, KEDA polls your event source (e.g., RabbitMQ queue) at the configured interval. If the queue has 0 messages, KEDA scales to zero. When messages arrive, it activates the deployment and feeds the queue metric to HPA for standard replica calculation.
    </p>

    <Callout type="tip">
      KEDA uses two CRDs: <code className="text-brand-300">ScaledObject</code> for long-running deployments (web servers, consumers) and <code className="text-brand-300">ScaledJob</code> for short-lived batch workloads.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">When to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Queue consumers (RabbitMQ, SQS, Kafka)</li>
      <li>Event-driven workloads</li>
      <li>You need scale-to-zero for cost savings</li>
      <li>Standard HPA metrics don&apos;t reflect actual load</li>
      <li>Cron-based pre-scaling before traffic windows</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">When NOT to Use</h2>
    <ul className="list-inside list-disc space-y-1 text-zinc-200">
      <li>Simple CPU-based scaling is sufficient (HPA is simpler)</li>
      <li>Your app can&apos;t tolerate cold-start latency from zero</li>
      <li>No external event source that correlates with load</li>
    </ul>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Example</h2>
    <div className="my-4 rounded-xl border border-zinc-700 bg-surface-raised p-5">
      <h3 className="mb-2 font-semibold text-brand-400">Order Processing Queue</h3>
      <p className="text-sm text-zinc-300">
        An e-commerce platform uses RabbitMQ for order processing. During a flash sale, the queue spikes to 5,000 messages. KEDA polls every 10 seconds and scales from 1 to 50 consumer pods, clearing the backlog in 2 minutes. After the sale, the queue drains and KEDA scales to zero, saving compute costs until the next burst.
      </p>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Step-by-Step Implementation</h2>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">1. Install KEDA</h3>
    <CodeBlock language="bash">{`helm repo add kedacore https://kedacore.github.io/charts
helm repo update
helm install keda kedacore/keda \\
  --namespace keda \\
  --create-namespace

# Verify
kubectl get pods -n keda`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">2. Deploy your consumer (start at 0 replicas)</h3>
    <CodeBlock language="yaml">{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-processor
spec:
  replicas: 0          # KEDA will manage this
  selector:
    matchLabels:
      app: order-processor
  template:
    metadata:
      labels:
        app: order-processor
    spec:
      containers:
      - name: processor
        image: myregistry/order-processor:2.1.0
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">3. Create the ScaledObject</h3>
    <CodeBlock language="yaml">{`apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: order-processor-scaler
spec:
  scaleTargetRef:
    name: order-processor
  pollingInterval: 10           # Check every 10 seconds
  cooldownPeriod: 60            # Wait 60s before scaling to zero
  minReplicaCount: 0            # Scale to zero when idle
  maxReplicaCount: 100
  triggers:
  - type: rabbitmq
    metadata:
      queueName: orders
      mode: QueueLength
      value: "5"                # 1 replica per 5 messages
    authenticationRef:
      name: rabbitmq-trigger-auth
---
apiVersion: keda.sh/v1alpha1
kind: TriggerAuthentication
metadata:
  name: rabbitmq-trigger-auth
spec:
  secretTargetRef:
  - parameter: host
    name: rabbitmq-credentials
    key: url`}</CodeBlock>

    <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-200">4. Verify</h3>
    <CodeBlock language="bash">{`kubectl apply -f order-processor.yaml
kubectl apply -f scaled-object.yaml
kubectl get scaledobject order-processor-scaler
kubectl get hpa  # KEDA creates this automatically`}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Common Pitfalls</h2>
    <PitfallTable pitfalls={[
      { pitfall: 'Cold start from zero', symptom: 'High latency on first request', fix: 'Set minReplicaCount: 1 for latency-sensitive workloads' },
      { pitfall: 'Authentication failures', symptom: '"error getting metrics"', fix: 'Verify TriggerAuthentication secrets exist and are correct' },
      { pitfall: 'Polling interval too long', symptom: 'Scaling reacts too slowly', fix: 'Reduce pollingInterval to 5-10 seconds' },
      { pitfall: 'Cooldown too short', symptom: 'Scale to zero then immediately back up', fix: 'Increase cooldownPeriod to 120-300 seconds' },
      { pitfall: 'KEDA and HPA conflict', symptom: 'Two HPAs for same deployment', fix: 'Delete manually-created HPA; KEDA creates its own' },
    ]} />
  </>
);

// ──────────────────────────────────────────
// EXPORT ALL DOCS
// ──────────────────────────────────────────
export const docs: DocPage[] = [
  {
    slug: 'hpa',
    title: 'Horizontal Pod Autoscaler (HPA)',
    description: 'Scale the number of pod replicas based on CPU, memory, or custom metrics.',
    content: hpaContent,
  },
  {
    slug: 'vpa',
    title: 'Vertical Pod Autoscaler (VPA)',
    description: 'Automatically adjust CPU and memory requests for containers.',
    content: vpaContent,
  },
  {
    slug: 'cluster-autoscaler',
    title: 'Cluster Autoscaler',
    description: 'Add or remove cluster nodes based on pending pods and utilization.',
    content: clusterAutoscalerContent,
  },
  {
    slug: 'keda',
    title: 'KEDA (Event-Driven Autoscaling)',
    description: 'Scale based on external events with support for scale-to-zero.',
    content: kedaContent,
  },
];

export function getDocBySlug(slug: string): DocPage | undefined {
  return docs.find((d) => d.slug === slug);
}

export function getAllDocSlugs(): string[] {
  return docs.map((d) => d.slug);
}
