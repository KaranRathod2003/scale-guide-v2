import type { SandboxExercise } from '@/types/sandbox';

export const k8sExercises: SandboxExercise[] = [
  {
    id: 'k8s-basic-deployment',
    title: 'Create a Deployment',
    difficulty: 'beginner',
    language: 'k8s-yaml',
    category: 'Deployment',
    description: 'Create a basic Kubernetes Deployment for an nginx web server.',
    challenge: 'Write a Deployment manifest for nginx with 3 replicas.',
    hint: 'You need apiVersion: apps/v1, kind: Deployment, and spec with replicas, selector, and template.',
    starterCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: `,
    solution: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80`,
    requiredKeywords: ['Deployment', 'replicas', 'nginx', 'containerPort'],
    setupContext: 'Create a Deployment that runs 3 nginx pods exposing port 80.',
    precomputedResults: [
      { apiVersion: 'apps/v1', kind: 'Deployment', name: 'nginx-deployment', namespace: undefined, spec: { replicas: 3 } },
    ],
  },
  {
    id: 'k8s-service',
    title: 'Create a Service',
    difficulty: 'beginner',
    language: 'k8s-yaml',
    category: 'Service',
    description: 'Expose a Deployment using a ClusterIP Service.',
    challenge: 'Write a Service manifest that routes traffic to nginx pods on port 80.',
    hint: 'Use kind: Service with spec.selector matching the Deployment labels and spec.ports.',
    starterCode: `apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - `,
    solution: `apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP`,
    requiredKeywords: ['Service', 'selector', 'port'],
    setupContext: 'Expose the nginx Deployment (label: app=nginx) on port 80.',
    precomputedResults: [
      { apiVersion: 'v1', kind: 'Service', name: 'nginx-service', namespace: undefined, spec: { ports: [{ port: 80 }] } },
    ],
  },
  {
    id: 'k8s-hpa',
    title: 'Create an HPA',
    difficulty: 'intermediate',
    language: 'k8s-yaml',
    category: 'Autoscaling',
    description: 'Set up a Horizontal Pod Autoscaler for a Deployment.',
    challenge: 'Create an HPA that scales the nginx deployment between 2 and 10 replicas based on 50% CPU utilization.',
    hint: 'Use apiVersion: autoscaling/v2, kind: HorizontalPodAutoscaler with scaleTargetRef pointing to the Deployment.',
    starterCode: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx-deployment
  minReplicas:
  maxReplicas:
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: `,
    solution: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50`,
    requiredKeywords: ['HorizontalPodAutoscaler', 'scaleTargetRef', 'minReplicas', 'maxReplicas', 'cpu'],
    setupContext: 'Target: nginx-deployment. Scale from 2 to 10 pods when CPU exceeds 50%.',
    precomputedResults: [
      { apiVersion: 'autoscaling/v2', kind: 'HorizontalPodAutoscaler', name: 'nginx-hpa', namespace: undefined, spec: { minReplicas: 2, maxReplicas: 10 } },
    ],
  },
  {
    id: 'k8s-configmap',
    title: 'Create a ConfigMap',
    difficulty: 'beginner',
    language: 'k8s-yaml',
    category: 'Configuration',
    description: 'Store configuration data in a ConfigMap.',
    challenge: 'Create a ConfigMap with database connection settings (DB_HOST, DB_PORT, DB_NAME).',
    hint: 'Use kind: ConfigMap with a data section containing key-value pairs.',
    starterCode: `apiVersion: v1
kind: ConfigMap
metadata:
  name: db-config
data:
  `,
    solution: `apiVersion: v1
kind: ConfigMap
metadata:
  name: db-config
data:
  DB_HOST: postgres-service
  DB_PORT: "5432"
  DB_NAME: myapp`,
    requiredKeywords: ['ConfigMap', 'data', 'DB_HOST'],
    setupContext: 'Store database connection settings: host=postgres-service, port=5432, name=myapp.',
    precomputedResults: [
      { apiVersion: 'v1', kind: 'ConfigMap', name: 'db-config', namespace: undefined, spec: {} },
    ],
  },
  {
    id: 'k8s-resource-limits',
    title: 'Resource Limits & Requests',
    difficulty: 'intermediate',
    language: 'k8s-yaml',
    category: 'Resources',
    description: 'Set CPU and memory limits on containers.',
    challenge: 'Create a Pod with resource requests (100m CPU, 128Mi memory) and limits (250m CPU, 256Mi memory).',
    hint: 'Add resources.requests and resources.limits under the container spec.',
    starterCode: `apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: myapp:1.0
    resources:
      requests:
        cpu:
        memory:
      limits:
        cpu:
        memory: `,
    solution: `apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: myapp:1.0
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "250m"
        memory: "256Mi"`,
    requiredKeywords: ['resources', 'requests', 'limits', 'cpu', 'memory'],
    setupContext: 'Container: myapp:1.0. Requests: 100m CPU, 128Mi RAM. Limits: 250m CPU, 256Mi RAM.',
    precomputedResults: [
      { apiVersion: 'v1', kind: 'Pod', name: 'resource-demo', namespace: undefined, spec: {} },
    ],
  },
  {
    id: 'k8s-ingress',
    title: 'Create an Ingress',
    difficulty: 'intermediate',
    language: 'k8s-yaml',
    category: 'Networking',
    description: 'Route external traffic to a Service via Ingress.',
    challenge: 'Create an Ingress that routes myapp.example.com to the nginx-service on port 80.',
    hint: 'Use kind: Ingress with rules containing host and http.paths.',
    starterCode: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name:
            port:
              number: `,
    solution: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80`,
    requiredKeywords: ['Ingress', 'host', 'backend', 'service'],
    setupContext: 'Route traffic for myapp.example.com to nginx-service:80.',
    precomputedResults: [
      { apiVersion: 'networking.k8s.io/v1', kind: 'Ingress', name: 'myapp-ingress', namespace: undefined, spec: {} },
    ],
  },
  {
    id: 'k8s-network-policy',
    title: 'Network Policy',
    difficulty: 'advanced',
    language: 'k8s-yaml',
    category: 'Security',
    description: 'Restrict pod-to-pod communication with a NetworkPolicy.',
    challenge: 'Create a NetworkPolicy that only allows traffic from pods with label role=frontend to pods with label app=api on port 8080.',
    hint: 'Use kind: NetworkPolicy with podSelector and ingress rules containing from and ports.',
    starterCode: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-frontend
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role:
    ports:
    - port: `,
    solution: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-frontend
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: frontend
    ports:
    - port: 8080
      protocol: TCP`,
    requiredKeywords: ['NetworkPolicy', 'podSelector', 'ingress', 'from'],
    setupContext: 'Restrict: only frontend pods can reach api pods on port 8080.',
    precomputedResults: [
      { apiVersion: 'networking.k8s.io/v1', kind: 'NetworkPolicy', name: 'api-allow-frontend', namespace: undefined, spec: {} },
    ],
  },
  {
    id: 'k8s-pvc',
    title: 'Persistent Volume Claim',
    difficulty: 'intermediate',
    language: 'k8s-yaml',
    category: 'Storage',
    description: 'Request persistent storage for a pod.',
    challenge: 'Create a PVC requesting 10Gi of storage with ReadWriteOnce access.',
    hint: 'Use kind: PersistentVolumeClaim with spec.accessModes and spec.resources.requests.storage.',
    starterCode: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    -
  resources:
    requests:
      storage: `,
    solution: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi`,
    requiredKeywords: ['PersistentVolumeClaim', 'accessModes', 'storage'],
    setupContext: 'Request 10Gi of persistent storage with ReadWriteOnce access mode.',
    precomputedResults: [
      { apiVersion: 'v1', kind: 'PersistentVolumeClaim', name: 'data-pvc', namespace: undefined, spec: {} },
    ],
  },
];
