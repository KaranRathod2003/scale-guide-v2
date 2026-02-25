import type { SandboxExercise } from '@/types/sandbox';

export const deploymentExercises: SandboxExercise[] = [
  {
    id: 'dep-rolling-update',
    title: 'Rolling Update Strategy',
    difficulty: 'beginner',
    language: 'deployment-yaml',
    category: 'Rolling Update',
    description: 'Configure a Deployment with a RollingUpdate strategy.',
    challenge: 'Set up a rolling update with maxSurge=1 and maxUnavailable=0 for zero-downtime deployment.',
    hint: 'Add spec.strategy.type: RollingUpdate with rollingUpdate.maxSurge and maxUnavailable.',
    starterCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge:
      maxUnavailable:
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: myapp:2.0
        ports:
        - containerPort: 8080`,
    solution: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: myapp:2.0
        ports:
        - containerPort: 8080`,
    requiredKeywords: ['RollingUpdate', 'maxSurge', 'maxUnavailable'],
    setupContext: 'Deploy myapp:2.0 with 4 replicas using zero-downtime rolling update (maxSurge=1, maxUnavailable=0).',
    precomputedResults: { strategy: 'RollingUpdate', maxSurge: 1, maxUnavailable: 0 },
  },
  {
    id: 'dep-recreate',
    title: 'Recreate Strategy',
    difficulty: 'beginner',
    language: 'deployment-yaml',
    category: 'Recreate',
    description: 'Configure a Deployment with the Recreate strategy.',
    challenge: 'Set up a Recreate deployment for a database migration worker that cannot run alongside the old version.',
    hint: 'Use spec.strategy.type: Recreate (no rollingUpdate params needed).',
    starterCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: migration-worker
spec:
  replicas: 1
  strategy:
    type:
  selector:
    matchLabels:
      app: migration
  template:
    metadata:
      labels:
        app: migration
    spec:
      containers:
      - name: worker
        image: migration-worker:3.0
        env:
        - name: DB_URL
          value: postgres://db:5432/myapp`,
    solution: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: migration-worker
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: migration
  template:
    metadata:
      labels:
        app: migration
    spec:
      containers:
      - name: worker
        image: migration-worker:3.0
        env:
        - name: DB_URL
          value: postgres://db:5432/myapp`,
    requiredKeywords: ['Recreate'],
    setupContext: 'Migration worker cannot run old and new versions simultaneously. Use Recreate strategy.',
    precomputedResults: { strategy: 'Recreate' },
  },
  {
    id: 'dep-canary-ingress',
    title: 'Canary with Ingress Annotations',
    difficulty: 'intermediate',
    language: 'deployment-yaml',
    category: 'Canary',
    description: 'Set up a canary deployment using nginx Ingress annotations.',
    challenge: 'Create an Ingress for a canary deployment that receives 20% of traffic.',
    hint: 'Use nginx.ingress.kubernetes.io/canary: "true" and canary-weight: "20".',
    starterCode: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-canary
  annotations:
    nginx.ingress.kubernetes.io/canary:
    nginx.ingress.kubernetes.io/canary-weight:
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-canary
            port:
              number: 80`,
    solution: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "20"
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-canary
            port:
              number: 80`,
    requiredKeywords: ['canary', 'canary-weight'],
    setupContext: 'Route 20% of myapp.example.com traffic to the canary service.',
    precomputedResults: { strategy: 'Canary', weight: 20 },
  },
  {
    id: 'dep-blue-green-service',
    title: 'Blue-Green Service Switching',
    difficulty: 'intermediate',
    language: 'deployment-yaml',
    category: 'Blue-Green',
    description: 'Configure a Service for blue-green deployment switching.',
    challenge: 'Create a Service that points to the green (v2) deployment. Switch it from blue (v1) to green (v2).',
    hint: 'Change the Service selector from version: blue to version: green.',
    starterCode: `apiVersion: v1
kind: Service
metadata:
  name: myapp
  labels:
    deployment-type: blue-green
spec:
  selector:
    app: myapp
    version:
  ports:
  - port: 80
    targetPort: 8080`,
    solution: `apiVersion: v1
kind: Service
metadata:
  name: myapp
  labels:
    deployment-type: blue-green
spec:
  selector:
    app: myapp
    version: green
  ports:
  - port: 80
    targetPort: 8080`,
    requiredKeywords: ['version', 'green'],
    setupContext: 'Switch the production Service from blue (v1) to green (v2) by updating the selector.',
    precomputedResults: { strategy: 'Blue-Green', activeVersion: 'green' },
  },
  {
    id: 'dep-rolling-maxsurge-percent',
    title: 'Rolling Update with Percentages',
    difficulty: 'intermediate',
    language: 'deployment-yaml',
    category: 'Rolling Update',
    description: 'Configure a rolling update using percentage-based maxSurge and maxUnavailable.',
    challenge: 'Configure a Deployment with 10 replicas, maxSurge of 25%, and maxUnavailable of 10%.',
    hint: 'Use string values like "25%" for maxSurge and "10%" for maxUnavailable.',
    starterCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge:
      maxUnavailable:
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: api-server:4.0
        ports:
        - containerPort: 3000`,
    solution: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: "25%"
      maxUnavailable: "10%"
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: api-server:4.0
        ports:
        - containerPort: 3000`,
    requiredKeywords: ['RollingUpdate', 'maxSurge', 'maxUnavailable', '25%'],
    setupContext: '10 replica API server with percentage-based rolling update: maxSurge=25%, maxUnavailable=10%.',
    precomputedResults: { strategy: 'RollingUpdate', maxSurge: '25%', maxUnavailable: '10%' },
  },
  {
    id: 'dep-probes',
    title: 'Health Check Probes',
    difficulty: 'intermediate',
    language: 'deployment-yaml',
    category: 'Health Checks',
    description: 'Add readiness and liveness probes for safe deployments.',
    challenge: 'Add a readinessProbe (HTTP GET /health on port 8080) and livenessProbe (HTTP GET /alive on port 8080) to a Deployment.',
    hint: 'Add readinessProbe and livenessProbe under the container spec with httpGet, initialDelaySeconds, and periodSeconds.',
    starterCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: web-app:2.0
        ports:
        - containerPort: 8080
        readinessProbe:
          httpGet:
            path:
            port:
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path:
            port:
          initialDelaySeconds: 15
          periodSeconds: 20`,
    solution: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: web-app:2.0
        ports:
        - containerPort: 8080
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /alive
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 20`,
    requiredKeywords: ['readinessProbe', 'livenessProbe', 'httpGet'],
    setupContext: 'Add health checks: readiness at /health, liveness at /alive, both on port 8080.',
    precomputedResults: { strategy: 'RollingUpdate', hasReadinessProbe: true, hasLivenessProbe: true },
  },
  {
    id: 'dep-hpa-custom-metrics',
    title: 'HPA with Custom Metrics',
    difficulty: 'advanced',
    language: 'deployment-yaml',
    category: 'Autoscaling',
    description: 'Scale based on custom metrics like request rate.',
    challenge: 'Create an HPA that scales based on an average request rate of 100 requests per second per pod.',
    hint: 'Use metrics type: Pods with metric name http_requests_per_second and averageValue.',
    starterCode: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Pods
    pods:
      metric:
        name:
      target:
        type: AverageValue
        averageValue: `,
    solution: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"`,
    requiredKeywords: ['HorizontalPodAutoscaler', 'Pods', 'http_requests_per_second'],
    setupContext: 'Scale api-server (2-20 replicas) based on 100 req/s per pod custom metric.',
    precomputedResults: { strategy: 'HPA-Custom', metric: 'http_requests_per_second', target: 100 },
  },
];
