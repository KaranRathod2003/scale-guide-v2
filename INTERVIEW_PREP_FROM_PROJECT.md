# Interview Prep: DSA Patterns & System Design from ScaleGuide

> Learn interview concepts by studying your own project. Each section maps real code from this codebase to DSA/System Design topics with related interview questions.

---

## Table of Contents

- [Part 1: Data Structures & Algorithms](#part-1-data-structures--algorithms)
  - [1. Hash Maps & Hash Sets](#1-hash-maps--hash-sets)
  - [2. String Manipulation Algorithms](#2-string-manipulation-algorithms)
  - [3. Searching & Scoring Algorithms](#3-searching--scoring-algorithms)
  - [4. Sorting with Custom Comparators](#4-sorting-with-custom-comparators)
  - [5. Array Manipulation Patterns](#5-array-manipulation-patterns)
  - [6. State Machines & Finite Automata](#6-state-machines--finite-automata)
  - [7. Trees & Hierarchical Traversal](#7-trees--hierarchical-traversal)
  - [8. Memoization & Caching (DP Concept)](#8-memoization--caching-dp-concept)
  - [9. Queue & Event Processing](#9-queue--event-processing)
  - [10. Prefix Sum / Cumulative Sum](#10-prefix-sum--cumulative-sum)
  - [11. Mathematical Algorithms](#11-mathematical-algorithms)
- [Part 2: System Design Topics](#part-2-system-design-topics)
  - [1. Multi-Source Data Aggregation Pipeline](#1-multi-source-data-aggregation-pipeline)
  - [2. Multi-Layer Caching Architecture](#2-multi-layer-caching-architecture)
  - [3. REST API Design](#3-rest-api-design)
  - [4. Pagination & Infinite Scroll](#4-pagination--infinite-scroll)
  - [5. Real-Time Simulation Engine](#5-real-time-simulation-engine)
  - [6. Content Management & Dynamic Routing](#6-content-management--dynamic-routing)
  - [7. Search System](#7-search-system)
  - [8. Recommendation / Decision Engine](#8-recommendation--decision-engine)
  - [9. Error Handling & Resilience Patterns](#9-error-handling--resilience-patterns)
  - [10. Component Architecture & Code Organization](#10-component-architecture--code-organization)
- [Part 3: Study Plan](#part-3-study-plan)
- [Part 4: Quick Reference Table](#part-4-quick-reference-table)

---

# Part 1: Data Structures & Algorithms

---

## 1. Hash Maps & Hash Sets

### Concept
Hash Maps (dictionaries/objects) provide O(1) average-case lookup, insertion, and deletion. Hash Sets provide O(1) membership testing and deduplication.

### Where in this project

#### a) Keyword Dictionary Lookup
**File:** `src/lib/assistant-logic.ts` (lines 3-27)

```typescript
const workloadKeywords: Record<WorkloadType, string[]> = {
  'web-api': ['api', 'rest', 'graphql', 'web', 'http', 'server', 'endpoint'],
  'background-worker': ['worker', 'background', 'consumer', 'queue', 'job', 'cron'],
  'data-pipeline': ['pipeline', 'etl', 'stream', 'batch', 'spark', 'flink'],
  'ml-inference': ['ml', 'model', 'inference', 'prediction', 'gpu', 'tensor'],
  'database': ['database', 'db', 'postgres', 'mysql', 'mongo', 'redis'],
  'monolith': ['monolith', 'legacy', 'all-in-one', 'single'],
};
```

**Why it matters:** This is a classic hash map pattern. Each key maps to an array of keywords. When a user types a message, the code checks which key has the most matching keywords -- essentially a hash-map-powered classifier.

#### b) Set-Based Deduplication
**File:** `src/lib/news/aggregator.ts` (lines 22-28)

```typescript
const seen = new Set<string>();
const deduped = all.filter((article) => {
  const key = article.url.toLowerCase().replace(/\/$/, '');
  if (seen.has(key)) return false;  // O(1) lookup
  seen.add(key);                     // O(1) insertion
  return true;
});
```

**Why it matters:** When aggregating news from multiple sources (RSS, Dev.to, GitHub), the same article might appear from different feeds. A Set provides O(1) deduplication instead of O(n) array scans.

#### c) In-Memory Cache with Map
**File:** `src/lib/news/cache.ts` (lines 1-42)

```typescript
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  fetchPromise?: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttlMs: number }
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    return existing.data;  // Cache HIT
  }

  if (existing?.fetchPromise) {
    return existing.fetchPromise;  // Request deduplication
  }

  const fetchPromise = fetcher();
  if (existing) {
    existing.fetchPromise = fetchPromise;
  }

  try {
    const data = await fetchPromise;
    cache.set(key, { data, expiresAt: now + options.ttlMs });
    return data;
  } catch (err) {
    if (existing) {
      cache.set(key, { data: existing.data, expiresAt: now + options.ttlMs / 2 });
      return existing.data;  // Serve stale on error
    }
    throw err;
  }
}
```

**Why it matters:** This is essentially an LRU-style cache implementation. It demonstrates:
- Cache-aside pattern (check cache first, fetch on miss)
- TTL-based expiration
- Request deduplication (multiple callers share one promise)
- Graceful degradation (serve stale data on fetch failure)

#### d) Custom String Hashing
**File:** `src/lib/news/rss-parser.ts` (lines 31-39)

```typescript
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;  // hash * 31 + char
    hash |= 0;  // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
```

**Why it matters:** This is the classic DJB2/Java-style hash function. Used to generate unique IDs for RSS articles from their URLs. Understanding hash functions is fundamental to hash tables.

### Related Interview Questions
| Difficulty | Problem | Connection |
|---|---|---|
| Easy | Two Sum (LC 1) | Hash map for O(1) complement lookup |
| Easy | Contains Duplicate (LC 217) | Set-based dedup (same as news aggregator) |
| Easy | Valid Anagram (LC 242) | Character frequency map |
| Medium | Group Anagrams (LC 49) | Hash map with sorted key |
| Medium | LRU Cache (LC 146) | Very similar to `cache.ts` implementation |
| Easy | Design HashMap (LC 706) | Implement hash function like `hashString()` |
| Medium | Longest Consecutive Sequence (LC 128) | Set-based O(n) solution |

---

## 2. String Manipulation Algorithms

### Concept
String algorithms involve parsing, transformation, matching, and comparison of text data. Common patterns include two-pointer scanning, regex transformation chains, and normalization for comparison.

### Where in this project

#### a) Manual XML Parsing (Two-Pointer / Cursor Pattern)
**File:** `src/lib/news/rss-parser.ts` (lines 4-16)

```typescript
function extractTag(xml: string, tag: string): string {
  const openTag = `<${tag}`;
  const closeTag = `</${tag}>`;
  const startIdx = xml.indexOf(openTag);
  if (startIdx === -1) return '';
  const contentStart = xml.indexOf('>', startIdx) + 1;
  const endIdx = xml.indexOf(closeTag, contentStart);
  if (endIdx === -1) return '';
  return xml
    .slice(contentStart, endIdx)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .trim();
}
```

**Why it matters:** Instead of using a full XML parser library, this implements tag extraction using index-based scanning. This is a classic **two-pointer** approach where you find the start boundary, then scan forward for the end boundary. Very similar to parsing problems in interviews.

#### b) Cursor-Based String Splitting
**File:** `src/lib/news/rss-parser.ts` (lines 18-30)

```typescript
function splitItems(xml: string): string[] {
  const items: string[] = [];
  let cursor = 0;
  while (true) {
    const start = xml.indexOf('<item', cursor);
    if (start === -1) break;
    const end = xml.indexOf('</item>', start);
    if (end === -1) break;
    items.push(xml.slice(start, end + 7));
    cursor = end + 7;
  }
  return items;
}
```

**Why it matters:** This is a sliding cursor pattern. The `cursor` variable moves forward through the string, extracting items one at a time. Similar to how you'd solve "find all occurrences of a pattern" problems.

#### c) HTML Entity Decoding / String Sanitization
**File:** `src/lib/news/rss-parser.ts` (lines 42-53)

```typescript
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')        // Remove all HTML tags
    .replace(/&amp;/g, '&')         // Decode &amp; -> &
    .replace(/&lt;/g, '<')          // Decode &lt; -> <
    .replace(/&gt;/g, '>')          // Decode &gt; -> >
    .replace(/&quot;/g, '"')        // Decode &quot; -> "
    .replace(/&#39;/g, "'")         // Decode &#39; -> '
    .replace(/&nbsp;/g, ' ')        // Decode &nbsp; -> space
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .trim();
}
```

**Why it matters:** This is a **transformation pipeline** -- a chain of string replacements applied sequentially. Each step transforms the string closer to the desired output. Pattern recognition: when you see chained `.replace()` calls, think "pipeline."

#### d) SQL Normalization for Structural Comparison
**File:** `src/lib/sandbox/validation/sql-validator.ts` (lines 3-28)

```typescript
function normalizeSQL(sql: string): string {
  return sql
    .toLowerCase()
    .replace(/--.*$/gm, '')           // Strip SQL comments
    .replace(/\s+/g, ' ')            // Normalize whitespace
    .replace(/\s*;\s*$/, '')          // Remove trailing semicolons
    .replace(/\s*,\s*/g, ', ')        // Normalize comma spacing
    .replace(/\(\s+/g, '(')          // Remove space after (
    .replace(/\s+\)/g, ')')          // Remove space before )
    .replace(/\s+as\s+/g, ' as ')    // Normalize AS keyword
    .trim();
}

function structurallyEquivalent(userSQL: string, solutionSQL: string): boolean {
  let userNorm = normalizeSQL(userSQL);
  let solNorm = normalizeSQL(solutionSQL);
  // Remove default ASC ordering (implicit in SQL)
  userNorm = userNorm.replace(/\s+asc\b/g, '');
  solNorm = solNorm.replace(/\s+asc\b/g, '');
  // Normalize quotes
  userNorm = userNorm.replace(/"/g, "'");
  solNorm = solNorm.replace(/"/g, "'");
  return userNorm === solNorm;
}
```

**Why it matters:** This demonstrates **string normalization** for comparison. In interviews, you often need to compare strings that might differ in formatting but are semantically equivalent (like anagram checking, but more complex). The key insight: normalize both strings to a canonical form, then compare.

### Related Interview Questions
| Difficulty | Problem | Connection |
|---|---|---|
| Easy | Valid Parentheses (LC 20) | Tag matching (open/close like XML) |
| Medium | Decode String (LC 394) | Nested parsing with cursor |
| Medium | String to Integer (LC 8) | Cursor-based character scanning |
| Hard | Regular Expression Matching (LC 10) | Pattern matching concepts |
| Medium | Group Anagrams (LC 49) | String normalization for comparison |
| Easy | Isomorphic Strings (LC 205) | Structural string equivalence |
| Hard | Minimum Window Substring (LC 76) | Sliding window on strings |

---

## 3. Searching & Scoring Algorithms

### Concept
Searching algorithms find target elements or the "best match" in a dataset. Scoring algorithms assign numerical values to candidates and select the highest-scoring one.

### Where in this project

#### a) Best-Match Scoring Algorithm
**File:** `src/lib/assistant-logic.ts` (lines 29-41)

```typescript
function extractBestMatch<T extends string>(
  text: string,
  keywords: Record<T, string[]>
): T | undefined {
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
```

**Why it matters:** This is a **linear search with scoring**. For each category, it counts how many keywords match in the user's text and picks the category with the highest count. This pattern appears everywhere: search ranking, recommendation systems, and classification problems.

**Algorithm breakdown:**
1. Iterate through all categories (outer loop)
2. For each category, count matching keywords (inner filter)
3. Track the best score and its category
4. Return the winner (or undefined if no matches)

**Time complexity:** O(C * K * T) where C = categories, K = avg keywords per category, T = text length

#### b) Multi-Criteria Search / Filtering
**File:** `src/app/api/news/route.ts`

```typescript
// Topic filtering
if (topics.length > 0) {
  filtered = filtered.filter((a) =>
    a.topics.some((t) => topics.includes(t))
  );
}

// Full-text search
if (query) {
  const q = query.toLowerCase();
  filtered = filtered.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q)
  );
}
```

**Why it matters:** This shows **pipeline filtering** -- applying multiple filter criteria sequentially. Each filter narrows the result set. In interviews, this maps to multi-condition search problems.

#### c) Topic Classification with Early Exit
**File:** `src/lib/news/topic-classifier.ts` (lines 4-25)

```typescript
export function classifyTopics(text: string, defaultTopics: NewsTopic[]): NewsTopic[] {
  const lower = text.toLowerCase();
  const matched = new Set<NewsTopic>(defaultTopics);

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        matched.add(topic);
        break;  // Early exit: one keyword match is enough per topic
      }
    }
  }

  return Array.from(matched);
}
```

**Why it matters:** The `break` statement is an optimization -- once you find one matching keyword for a topic, you don't need to check the rest. This is a common optimization pattern in search problems.

### Related Interview Questions
| Difficulty | Problem | Connection |
|---|---|---|
| Medium | Top K Frequent Elements (LC 347) | Scoring and ranking |
| Medium | Kth Largest Element (LC 215) | Finding best match in collection |
| Medium | Search a 2D Matrix (LC 74) | Multi-criteria search |
| Easy | Binary Search (LC 704) | Optimized search |
| Medium | Find All Anagrams (LC 438) | Pattern matching with scoring |

---

## 4. Sorting with Custom Comparators

### Concept
Sorting with custom comparators allows you to define arbitrary ordering rules beyond simple numeric/alphabetic sorting.

### Where in this project

**File:** `src/lib/news/aggregator.ts` (lines 30-32)

```typescript
deduped.sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);
```

**Why it matters:** This sorts articles by date in **descending order** (newest first). The comparator returns:
- Negative if `b` is older (so `a` comes first)
- Positive if `b` is newer (so `b` comes first)
- Zero if equal

**Key insight:** `b - a` = descending, `a - b` = ascending. This is the most common comparator pattern in JavaScript.

### Related Interview Questions
| Difficulty | Problem | Connection |
|---|---|---|
| Medium | Merge Intervals (LC 56) | Sort by start time then merge |
| Medium | Sort Colors (LC 75) | Custom sorting (Dutch National Flag) |
| Easy | Sort Array by Parity (LC 905) | Custom partition sort |
| Medium | Custom Sort String (LC 791) | User-defined ordering |

---

## 5. Array Manipulation Patterns

### Concept
Array manipulation involves creating, transforming, merging, and efficiently processing arrays. Key patterns include immutable updates, reverse traversal, sliding windows, and flattening.

### Where in this project

#### a) Reverse Traversal for Pod Termination
**File:** `src/lib/simulator/scalingLogic.ts` (lines 69-82)

```typescript
// When scaling down, find pods to terminate from the END
const marked = [...alivePods];
for (let i = marked.length - 1; i >= 0 && toRemove > 0; i--) {
  if (marked[i].status === 'running' && marked.length - 1 >= config.minPods) {
    marked[i] = { ...marked[i], status: 'terminating' };
    break;
  }
}
```

**Why it matters:** Iterating backwards is a common pattern when you need to remove/modify elements from the end. Here it's used to terminate the most recently added pods first (LIFO behavior). In interviews, backward traversal avoids index shifting issues.

#### b) Array Generation with Array.from
**File:** `src/lib/simulator/deploymentLogic.ts` (lines 34-37)

```typescript
const greens: SimServer[] = Array.from({ length: config.replicas }, (_, i) => ({
  id: `green-${i}`,
  version: 'v2',
  status: 'deploying',
  label: `green-${i + 1}`,
}));
```

**Why it matters:** `Array.from({ length: n })` is a clean way to create arrays of a specific size with computed values. More readable than loops.

#### c) Immutable Array Merge with Spread
**File:** `src/lib/simulator/deploymentLogic.ts`

```typescript
servers = [...servers.filter((s) => s.version === 'v1'), ...greens];
```

**Why it matters:** This combines `filter` + `spread` for immutable array manipulation. It keeps all v1 servers and adds new v2 (green) servers. This pattern is essential in React state management where you can't mutate state directly.

#### d) FlatMap for Resilient Data Merging
**File:** `src/lib/news/aggregator.ts` (lines 9-10)

```typescript
Promise.allSettled(RSS_SOURCES.map((s) => fetchRSSFeed(s))).then((results) =>
  results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
);
```

**Why it matters:** `flatMap` both maps and flattens in one step. Here it converts `PromiseSettledResult<NewsArticle[]>[]` into `NewsArticle[]`, ignoring failed promises by mapping them to empty arrays.

#### e) Sliding Window History Buffer
**File:** `src/lib/simulator/useSimulation.ts`

```typescript
const newTrafficHistory = [...prev.trafficHistory, traffic].slice(-50);
const newReplicaHistory = [...prev.replicaHistory, runningCount].slice(-50);
```

**Why it matters:** This maintains a fixed-size sliding window of the last 50 data points. `slice(-50)` keeps only the last 50 elements, creating a bounded buffer. This is the fundamental pattern behind **sliding window** problems.

#### f) Pagination Slicing
**File:** `src/app/api/news/route.ts`

```typescript
const start = (page - 1) * limit;
const paged = filtered.slice(start, start + limit);
```

**Why it matters:** Classic offset-based pagination. Convert page number to array indices.

### Related Interview Questions
| Difficulty | Problem | Connection |
|---|---|---|
| Easy | Merge Sorted Array (LC 88) | Array merging with spread |
| Easy | Move Zeroes (LC 283) | In-place array manipulation |
| Medium | Rotate Array (LC 189) | Array transformation |
| Hard | Sliding Window Maximum (LC 239) | Fixed-size window like history buffer |
| Medium | Flatten Nested List Iterator (LC 341) | FlatMap concept |
| Easy | Intersection of Two Arrays (LC 349) | Filter + Set combination |
| Medium | Product of Array Except Self (LC 238) | Array transformation without mutation |

---

## 6. State Machines & Finite Automata

### Concept
A state machine has a finite set of states, transitions between them triggered by events, and an initial state. They're perfect for modeling anything with a lifecycle (orders, connections, deployments).

### Where in this project

This project has **6+ state machine implementations** -- it's a goldmine for this topic!

#### a) Blue-Green Deployment State Machine
**File:** `src/lib/simulator/deploymentLogic.ts`

```
States: idle -> deploying -> monitoring -> complete
                    |                          |
                    +--- rolling-back <---------+
```

```typescript
export function blueGreenTick(state, config): { phase, servers, ... } {
  const ticksSinceDeploy = state.tick - deployEvent.tick;

  // Phase 1: Spin up green environment
  if (ticksSinceDeploy === 1) {
    phase = 'deploying';
    // Create green servers
  }

  // Phase 2: Health checks pass
  if (ticksSinceDeploy === config.healthCheckDuration + 1) {
    // Green servers become running
  }

  // Phase 3: Switch traffic
  if (ticksSinceDeploy === config.healthCheckDuration + 3) {
    phase = 'monitoring';
    // v1Traffic = 0, v2Traffic = 100
  }

  // Auto-rollback on errors
  if (errorRate > config.rollbackThreshold && phase !== 'rolling-back') {
    phase = 'rolling-back';
  }
}
```

#### b) Canary Deployment State Machine (Multi-Stage)
**File:** `src/lib/simulator/deploymentLogic.ts`

```
States: idle -> deploying -> stage[0] -> stage[1] -> ... -> stage[n] -> complete
                   |            |           |                    |
                   +--- rolling-back <------+--------------------+
```

```typescript
export function canaryTick(state, config): { currentStage, phase, ... } {
  const stageIdx = Math.floor((ticksSinceDeploy - 3) / config.stageDuration);

  if (stageIdx >= 0 && stageIdx < config.stages.length && stageIdx !== currentStage) {
    currentStage = stageIdx;
    const pct = config.stages[stageIdx];  // e.g., [1, 5, 10, 25, 50, 100]
    v2Traffic = pct;
    v1Traffic = 100 - pct;

    if (pct === 100) {
      phase = 'complete';
    }
  }

  // Rollback on errors at any stage
  if (errorRate > threshold) {
    phase = 'rolling-back';
  }
}
```

**Why it matters:** The canary FSM has variable number of stages (configured via `config.stages` array). This demonstrates **parameterized state machines** where the states themselves are data-driven.

#### c) PostgreSQL Connection Lifecycle
**File:** `src/lib/simulator/postgresqlLogic.ts`

```
States: dns-resolve -> tcp-connect -> ssl-handshake -> auth -> query-send -> query-execute -> response -> complete
```

```typescript
const CONNECTION_STEPS: ConnectionStep[] = [
  { phase: 'dns-resolve',    label: 'Resolving DNS...',              duration: 2 },
  { phase: 'tcp-connect',    label: 'Establishing TCP connection...', duration: 3 },
  { phase: 'ssl-handshake',  label: 'Negotiating SSL/TLS...',        duration: 2 },
  { phase: 'auth',           label: 'Authenticating...',             duration: 2 },
  { phase: 'query-send',     label: 'Sending query...',              duration: 1 },
  { phase: 'query-execute',  label: 'Server parsing & executing...', duration: 3 },
  { phase: 'response',       label: 'Receiving result set...',       duration: 2 },
  { phase: 'complete',       label: 'Query complete!',               duration: 1 },
];
```

**Why it matters:** This is a **linear state machine** with timed transitions. Each state has a fixed duration, and progress is tracked via cumulative ticks. This is exactly how TCP connection state machines work in networking.

#### d) Conversation State Machine
**File:** `src/lib/assistant-logic.ts`

```
States: step1 (ask workload) -> step2 (ask trigger) -> step3 (ask preferences) -> step4 (recommendation)
```

```typescript
export function processUserMessage(message: string, state: ConversationState): ConversationState {
  switch (state.step) {
    case 1: {
      // Extract workload type and traffic pattern
      newState.step = 2;
      break;
    }
    case 2: {
      // Extract scaling trigger
      newState.step = 3;
      break;
    }
    case 3: {
      // Extract preferences (scale-to-zero, complexity)
      newState.step = 4;
      break;
    }
  }
  return newState;
}
```

#### e) Pod Lifecycle State Machine
**File:** `src/lib/simulator/scalingLogic.ts`

```
States: pending -> running -> terminating -> (removed)
```

```typescript
// Pending pods become running after warmup
newPods = alivePods.map((p) =>
  p.status === 'pending' ? { ...p, status: 'running' } : p
);

// Scale down: running -> terminating
marked[i] = { ...marked[i], status: 'terminating' };

// Remove terminated pods
newPods = newPods.filter((p) => p.status !== 'terminating');
```

### Related Interview Questions
| Difficulty | Problem | Connection |
|---|---|---|
| Hard | Valid Number (LC 65) | Classic FSM problem |
| Medium | UTF-8 Validation (LC 393) | State-based byte validation |
| Hard | Regular Expression Matching (LC 10) | NFA/DFA concepts |
| Medium | Design: Vending Machine | Multi-state FSM with transitions |
| Medium | Design: Order State Machine | Lifecycle management like pods |
| Medium | Design: Traffic Light Controller | Timed transitions like connection steps |

---

## 7. Trees & Hierarchical Traversal

### Concept
Tree data structures represent hierarchical relationships. Traversal means visiting nodes in a specific order (DFS: pre/in/post-order, BFS: level-order).

### Where in this project

#### a) Kubernetes Resource Tree Traversal
**File:** `src/lib/sandbox/k8s-resource-mapper.ts`

```typescript
export function mapResourcesToVisual(resources: K8sResource[]): VisualResource[] {
  return resources.map((r) => {
    const details: { label: string; value: string }[] = [];
    const spec = r.spec || {};

    // Level 1: Resource metadata
    details.push({ label: 'API Version', value: r.apiVersion });

    // Level 2: Spec details
    if (r.kind === 'Deployment' || r.kind === 'StatefulSet') {
      // Level 3: Template
      const template = spec.template as Record<string, unknown> | undefined;
      // Level 4: Template spec
      const templateSpec = template?.spec as Record<string, unknown> | undefined;
      // Level 5: Containers
      const containers = (templateSpec?.containers || []) as Record<string, unknown>[];
      for (const c of containers) {
        if (c.image) details.push({ label: 'Image', value: String(c.image) });
      }
    }

    return { kind: r.kind, name: r.name, details };
  });
}
```

**Why it matters:** K8s manifests are deeply nested trees:
```
Deployment
  └── spec
      ├── replicas
      ├── strategy
      └── template
          └── spec
              └── containers[]
                  ├── name
                  ├── image
                  └── resources
```
The code traverses this tree depth-first, extracting relevant information at each level.

#### b) Navigation Hierarchy
**File:** `src/lib/constants.ts`

```typescript
export const TOPICS = [
  {
    title: 'Autoscaling',
    items: [
      { slug: 'hpa', title: 'HPA', href: '/docs/hpa' },
      { slug: 'vpa', title: 'VPA', href: '/docs/vpa' },
      // ...
    ],
  },
  {
    title: 'Deployment',
    items: [
      { slug: 'blue-green', title: 'Blue-Green', href: '/deployment-strategies/blue-green' },
      // ...
    ],
  },
];
```

**Why it matters:** The navigation is an N-ary tree. The sidebar component traverses this tree to render the navigation menu, highlighting the current path.

### Related Interview Questions
| Difficulty | Problem | Connection |
|---|---|---|
| Easy | Maximum Depth of Binary Tree (LC 104) | Tree depth traversal |
| Medium | Binary Tree Level Order Traversal (LC 102) | BFS through tree |
| Medium | Flatten Nested List Iterator (LC 341) | Flatten hierarchical data |
| Medium | Lowest Common Ancestor (LC 236) | Tree path finding |
| Medium | Serialize/Deserialize Binary Tree (LC 297) | Tree <-> flat data |

---

## 8. Memoization & Caching (DP Concept)

### Concept
Memoization stores the results of expensive computations so they don't need to be recalculated. It's the foundation of dynamic programming (top-down approach).

### Where in this project

#### a) Cache-Aside Pattern (Application Level)
**File:** `src/lib/news/cache.ts`

Already covered in detail in [Section 1c](#c-in-memory-cache-with-map). This is the most important file for understanding caching patterns.

**Key DP connection:** The cache stores results of "subproblems" (API fetches). When the same "subproblem" is requested again within TTL, the cached result is returned instead of recomputing.

#### b) React useCallback Memoization
**File:** `src/components/news/NewsFeed.tsx`

```typescript
const fetchNews = useCallback(
  async (pageNum: number, append: boolean) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedTopics.length > 0) params.set('topics', selectedTopics.join(','));
    if (searchQuery) params.set('q', searchQuery);
    params.set('page', String(pageNum));
    const res = await fetch(`/api/news?${params.toString()}`);
    const data = await res.json();
    setArticles((prev) => (append ? [...prev, ...data.articles] : data.articles));
    setHasMore(data.hasMore);
    setLoading(false);
  },
  [selectedTopics, searchQuery]  // Only recreate when these dependencies change
);
```

**Why it matters:** `useCallback` is React's memoization for functions. The function is only recreated when `selectedTopics` or `searchQuery` change. This prevents unnecessary re-renders of child components that receive this function as a prop.

**DP connection:** Think of `[selectedTopics, searchQuery]` as the "state" of the subproblem. If the state hasn't changed, return the cached function reference.

#### c) Request Deduplication (Overlapping Subproblems)
**File:** `src/lib/news/cache.ts`

```typescript
if (existing?.fetchPromise) {
  return existing.fetchPromise;  // Share ongoing computation
}
```

**Why it matters:** If 10 users request `/api/news` simultaneously while the cache is cold, only ONE actual fetch occurs. The other 9 requests share the same Promise. This is exactly the "overlapping subproblems" concept from DP -- multiple callers need the same result, so we compute it once.

### Related Interview Questions
| Difficulty | Problem | Connection |
|---|---|---|
| Easy | Climbing Stairs (LC 70) | Basic memoization |
| Medium | Coin Change (LC 322) | Cache results of subproblems |
| Medium | Word Break (LC 139) | Memoized string matching |
| Medium | Unique Paths (LC 62) | Grid memoization |
| Medium | LRU Cache (LC 146) | Cache with eviction (like TTL cache) |

---

## 9. Queue & Event Processing

### Concept
Queues process items in order (FIFO). Event queues are central to event-driven architectures. Time-windowed queues only keep recent events.

### Where in this project

#### a) Time-Windowed Event Queue
**File:** `src/lib/simulator/useSimulation.ts`

```typescript
// Only keep events from last 60 ticks
const activeEvents = prev.events.filter((e) => newTick - e.tick < 60);
const latestEvent = activeEvents[activeEvents.length - 1];

if (latestEvent) {
  traffic = applyTrafficEvent(traffic, BASE_TRAFFIC, latestEvent.type, newTick - latestEvent.tick);
}
```

**Why it matters:** This is a **sliding time window** on an event queue. Events older than 60 ticks are discarded. The latest active event determines the current traffic pattern. This is the exact pattern used in:
- Rate limiters (keep requests in last N seconds)
- Hit counters (count events in a time window)
- Log aggregation systems

#### b) Event-Driven Simulation
**File:** `src/lib/simulator/useSimulation.ts`

```typescript
const triggerEvent = useCallback((type: SimEventType) => {
  setState((prev) => ({
    ...prev,
    events: [...prev.events, { type, tick: prev.tick }],
  }));
}, []);
```

Events like `traffic_spike`, `pod_crash`, `deploy_v2` are pushed to an event array. Each simulation tick processes active events and applies their effects.

### Related Interview Questions
| Difficulty | Problem | Connection |
|---|---|---|
| Medium | Design Hit Counter (LC 362) | Time-windowed counter (very similar!) |
| Medium | Task Scheduler (LC 621) | Event scheduling with constraints |
| Medium | Number of Recent Calls (LC 933) | Sliding window on timestamps |
| Medium | Design: Message Queue | Producer-consumer with event processing |

---

## 10. Prefix Sum / Cumulative Sum

### Concept
Prefix sum pre-computes cumulative totals so range queries can be answered in O(1). Instead of summing a range each time, you subtract two prefix sums.

### Where in this project

**File:** `src/lib/simulator/postgresqlLogic.ts`

```typescript
export function connectionTick(state: ConnectionSimState): ConnectionSimState {
  const newTick = state.tick + 1;
  let cumulativeTicks = 0;
  let currentStepIndex = -1;
  let currentPhase: ConnectionPhase = 'complete';

  for (let i = 0; i < CONNECTION_STEPS.length; i++) {
    cumulativeTicks += CONNECTION_STEPS[i].duration;
    if (newTick <= cumulativeTicks) {
      currentStepIndex = i;
      currentPhase = CONNECTION_STEPS[i].phase;
      break;
    }
  }
  // Given tick 7: cumulative = [2, 5, 7, 9, 10, 13, 15, 16]
  // tick 7 <= 7 (after ssl-handshake), so we're at ssl-handshake phase
}
```

**Why it matters:** The connection steps have durations [2, 3, 2, 2, 1, 3, 2, 1]. The cumulative sums are [2, 5, 7, 9, 10, 13, 15, 16]. To find which phase we're in at tick T, we scan the cumulative sums until we find one >= T. This is essentially a prefix sum lookup.

**Optimization opportunity:** If this were called frequently, you could pre-compute the prefix sums array and use binary search for O(log n) lookup instead of O(n) linear scan.

### Related Interview Questions
| Difficulty | Problem | Connection |
|---|---|---|
| Easy | Range Sum Query (LC 303) | Basic prefix sum |
| Medium | Subarray Sum Equals K (LC 560) | Prefix sum + hash map |
| Medium | Contiguous Array (LC 525) | Prefix sum variant |
| Medium | Find Pivot Index (LC 724) | Prefix sum application |

---

## 11. Mathematical Algorithms

### Concept
Many real-world problems require mathematical modeling -- ceiling division, exponential functions, bounded growth, and rate calculations.

### Where in this project

#### a) HPA Scaling Formula (Ceiling Division)
**File:** `src/lib/simulator/scalingLogic.ts`

```typescript
function hpaDesiredReplicas(currentReplicas: number, avgCpu: number, config: HPAConfig): number {
  const ratio = avgCpu / config.targetCpu;
  const desired = Math.ceil(currentReplicas * ratio);
  return Math.max(config.minPods, Math.min(config.maxPods, desired));
}
```

**Why it matters:** This is the actual Kubernetes HPA formula. `Math.ceil` ensures we always round UP (you can't have half a pod). `Math.max/Math.min` clamps the result within bounds. This "compute then clamp" pattern appears constantly.

#### b) Non-Linear Latency Modeling
**File:** `src/lib/simulator/metricsEngine.ts`

```typescript
const loadPerPod = traffic / podCount;
const latencyMs = Math.round(BASE_LATENCY_MS * (1 + Math.pow(loadPerPod / 80, 1.5)));
```

**Why it matters:** Uses a power function (x^1.5) to model how latency increases non-linearly under load. At low load, latency barely changes. At high load, it spikes exponentially. This is realistic modeling -- in real systems, latency doesn't increase linearly.

#### c) Bounded Growth Rate
**File:** `src/lib/simulator/scalingLogic.ts`

```typescript
// Don't add too many pods at once
const toAdd = Math.min(desired - current, Math.max(1, Math.ceil(current * 0.5)));
```

**Why it matters:** The scaling rate is bounded to at most 50% growth per tick. This prevents thrashing (adding 100 pods when you only need 5 more). This "rate limiting growth" pattern appears in many algorithms.

### Related Interview Questions
| Difficulty | Problem | Connection |
|---|---|---|
| Medium | Pow(x, n) (LC 50) | Power function implementation |
| Easy | Divide Two Integers (LC 29) | Division without divide operator |
| Medium | Sqrt(x) (LC 69) | Mathematical computation |
| Medium | Design: Rate Limiter | Bounded rate calculations |

---

# Part 2: System Design Topics

---

## 1. Multi-Source Data Aggregation Pipeline

### Where in code
`src/lib/news/aggregator.ts`, `src/lib/news/rss-parser.ts`, `src/lib/news/devto-client.ts`, `src/lib/news/github-client.ts`

### Architecture

```
                   ┌─────────────────┐
                   │  /api/news      │
                   │  (entry point)  │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │  Cache Layer    │
                   │  (15-min TTL)   │
                   └────────┬────────┘
                            │ cache miss
                   ┌────────▼────────┐
                   │  Aggregator     │
                   │  (fan-out)      │
                   └───┬────┬────┬───┘
            ┌──────────┘    │    └──────────┐
    ┌───────▼──────┐ ┌─────▼─────┐ ┌───────▼──────┐
    │  RSS Parser  │ │  Dev.to   │ │   GitHub     │
    │  (5 feeds)   │ │  Client   │ │   Client     │
    └───────┬──────┘ └─────┬─────┘ └───────┬──────┘
            └──────────────┼───────────────┘
                   ┌───────▼───────┐
                   │  Merge +      │
                   │  Deduplicate  │
                   │  + Sort       │
                   └───────────────┘
```

### Key Design Decisions

1. **Fan-out / Fan-in:** Three data sources fetched in parallel with `Promise.allSettled`
2. **Partial Failure Tolerance:** If RSS fails but Dev.to succeeds, users still get articles
3. **Deduplication:** URL-based Set ensures no duplicates across sources
4. **Classification:** Articles auto-tagged with topics based on keyword matching
5. **Caching:** 15-minute cache prevents hammering external APIs

### Interview Connection
This is the core of "Design a News Feed" -- one of the most common system design questions.

**Interview questions to practice:**
- Design Twitter/Facebook News Feed
- Design a Web Crawler
- Design Google News
- Design an RSS Aggregator

---

## 2. Multi-Layer Caching Architecture

### Where in code
`src/lib/news/cache.ts`, `src/app/api/news/route.ts`, external fetch calls

### Three Cache Layers

```
┌──────────────────────────────────────────────────────┐
│  Layer 1: HTTP Cache (Browser + CDN)                  │
│  Cache-Control: public, s-maxage=300,                 │
│                 stale-while-revalidate=600            │
│  - CDN caches for 5 minutes                          │
│  - Serves stale for 10 minutes while revalidating    │
├──────────────────────────────────────────────────────┤
│  Layer 2: Next.js ISR (Server)                        │
│  fetch(url, { next: { revalidate: 900 } })           │
│  - Regenerates static content every 15 minutes       │
│  - Zero cost for repeated requests within window     │
├──────────────────────────────────────────────────────┤
│  Layer 3: Application Cache (In-Memory Map)           │
│  getCachedOrFetch(key, fetcher, { ttlMs: 900000 })   │
│  - 15-minute TTL                                     │
│  - Request deduplication                             │
│  - Stale fallback on error                           │
└──────────────────────────────────────────────────────┘
```

### Advanced Patterns Demonstrated

| Pattern | Implementation | Why It Matters |
|---|---|---|
| **Cache-Aside** | Check cache, fetch on miss, store result | Most common caching pattern |
| **Stale-While-Revalidate** | HTTP header + error fallback | Availability over freshness |
| **Request Deduplication** | Share `fetchPromise` among callers | Prevents thundering herd |
| **TTL-Based Expiration** | `expiresAt: now + ttlMs` | Simple time-based invalidation |
| **Graceful Degradation** | Serve stale data with half TTL on error | System stays available |

### Interview Connection
- Design a CDN
- Design a Distributed Cache
- Cache Invalidation Strategies
- Thundering Herd Problem

---

## 3. REST API Design

### Where in code
`src/app/api/news/route.ts`, `src/app/api/assistant/route.ts`

### News API Design

```
GET /api/news?topics=scaling,deployment&q=kubernetes&page=1&limit=20

Response:
{
  "articles": [...],
  "total": 150,
  "page": 1,
  "hasMore": true
}
```

**Design decisions:**
- **Query params for filtering** (not POST body) -- correct REST semantics for read operations
- **Bounded pagination** -- `limit` clamped to 1-50, prevents abuse
- **Structured response** -- includes metadata (`total`, `hasMore`) for client pagination
- **Cache headers** -- enables CDN caching for GET requests

### Assistant API Design

```
POST /api/assistant
Body: { "message": "I have a web API with spiky traffic", "conversationState": {...} }

Response:
{
  "message": "What metrics trigger your scaling decisions?",
  "conversationState": { "step": 2, "answers": {...} },
  "recommendation": null
}
```

**Design decisions:**
- **Stateless server** -- conversation state lives in client, passed each request
- **POST for mutations** -- conversation advances state
- **Progressive response** -- recommendation only in final step

### Interview Connection
- Design a REST API
- REST vs GraphQL
- API Versioning Strategies
- Idempotency in APIs

---

## 4. Pagination & Infinite Scroll

### Where in code
`src/app/api/news/route.ts` (backend), `src/components/news/NewsFeed.tsx` (frontend)

### Backend: Offset-Based Pagination

```typescript
const start = (page - 1) * limit;
const paged = filtered.slice(start, start + limit);

return {
  articles: paged,
  total: filtered.length,
  page,
  hasMore: start + limit < filtered.length,
};
```

### Frontend: Intersection Observer Infinite Scroll

```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNews(nextPage, true);  // append mode
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasMore, loading, page, fetchNews]);
```

### Tradeoffs Discussed in Interviews

| Approach | Pros | Cons | Used Here? |
|---|---|---|---|
| **Offset pagination** | Simple, supports jump-to-page | Drift on insert/delete, slow for large offsets | Yes |
| **Cursor pagination** | No drift, efficient for large datasets | Can't jump to page, more complex | No |
| **Infinite scroll** | Smooth UX, no page breaks | Hard to bookmark, back button issues | Yes |
| **Load more button** | User controls pace, bookmarkable | Requires user action | No |

### Interview Connection
- Cursor vs Offset Pagination
- Design Infinite Scroll
- Design a Social Media Feed

---

## 5. Real-Time Simulation Engine

### Where in code
`src/lib/simulator/useSimulation.ts`, `src/lib/simulator/scalingLogic.ts`, `src/lib/simulator/metricsEngine.ts`

### Architecture

```
┌─────────────────────────────────────────┐
│              Simulation Loop             │
│                                          │
│  setInterval(tick, 400ms / speed)        │
│                                          │
│  Each tick:                              │
│  1. Process active events                │
│  2. Calculate traffic                    │
│  3. Run scaling algorithm                │
│  4. Update pod states                    │
│  5. Calculate metrics                    │
│  6. Generate hints                       │
│  7. Push to history buffer               │
│                                          │
│  Speed: 1x (400ms) | 2x (200ms) | 4x   │
└─────────────────────────────────────────┘
```

### Key Concepts

| Concept | Implementation | Real-World Equivalent |
|---|---|---|
| **Game loop** | `setInterval` with tick function | Game engines, physics simulations |
| **Event system** | Events array with tick timestamps | Event sourcing, CQRS |
| **Speed control** | Interval = BASE / speed | Playback speed (1x, 2x) |
| **History buffer** | Last 50 entries with `.slice(-50)` | Time-series databases |
| **Metrics engine** | Calculate CPU, latency, cost per tick | Monitoring systems (Prometheus) |

### Interview Connection
- Design a Monitoring/Metrics System
- Design a Game Engine Tick System
- Event Sourcing Architecture
- Design a Stock Ticker

---

## 6. Content Management & Dynamic Routing

### Where in code
`src/app/docs/[slug]/page.tsx`, `src/lib/scaling-data.ts`

### Pattern: Static Generation with Dynamic Routes

```typescript
// Generate all possible routes at build time
export function generateStaticParams() {
  return scalingApproaches.map((approach) => ({
    slug: approach.slug,
  }));
}

// Render the page for a specific slug
export default async function DocPage({ params }) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();  // 404 page

  return <DocContent doc={doc} />;
}
```

### Why This Design?
- **Build-time generation** (`generateStaticParams`) = zero server cost per request
- **Dynamic routes** (`[slug]`) = one component handles all doc pages
- **Data-driven** = adding a new doc only requires adding data, not new files

### Interview Connection
- Design a CMS (Content Management System)
- Static vs Dynamic Rendering
- URL Routing Design

---

## 7. Search System

### Where in code
`src/app/api/news/route.ts`, `src/lib/news/topic-classifier.ts`, `src/lib/news/sources.ts`

### Two Types of Search Implemented

#### Type 1: Full-Text Substring Search
```typescript
if (query) {
  const q = query.toLowerCase();
  filtered = filtered.filter(
    (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
  );
}
```
Simple but effective for small datasets. O(n * m) where n = articles, m = query length.

#### Type 2: Keyword-Based Classification
```typescript
const TOPIC_KEYWORDS: Record<NewsTopic, string[]> = {
  scaling: ['autoscal', 'hpa', 'vpa', 'keda', 'scale', 'horizontal pod', ...],
  deployment: ['deploy', 'blue-green', 'canary', 'rolling update', ...],
  postgresql: ['postgres', 'postgresql', 'sql', 'database', 'pgbouncer', ...],
};
```
Maps text to categories using keyword dictionaries. Used for automatic article tagging.

### How to Scale This (Interview Discussion Points)

| Scale | Approach | Example |
|---|---|---|
| **100s of articles** | In-memory filter (current) | This project |
| **10K-100K** | Inverted index | Elasticsearch |
| **Millions** | Distributed search | Solr/Elasticsearch cluster |
| **Billions** | Sharded index + ranking | Google-scale |

### Interview Connection
- Design a Search Engine
- Design Typeahead / Autocomplete
- Inverted Index Data Structure
- TF-IDF and Ranking Algorithms

---

## 8. Recommendation / Decision Engine

### Where in code
`src/lib/assistant-logic.ts`, `src/lib/deployment-assistant-logic.ts`, `src/lib/postgresql-assistant-logic.ts`

### Architecture

```
User Message
    │
    ▼
┌──────────────────┐
│ extractBestMatch  │  ← Keyword scoring
│ (classify input)  │
└────────┬─────────┘
         │
    ▼
┌──────────────────┐
│ processUserMsg    │  ← State machine (step 1→2→3→4)
│ (advance state)   │
└────────┬─────────┘
         │
    ▼ (at step 4)
┌──────────────────┐
│ generateRecommendation │  ← Rule-based engine
│ (scoring + rules)      │
└────────┬───────────────┘
         │
    ▼
┌──────────────────┐
│ Recommendation   │
│ - primary: 'hpa' │
│ - secondary: 'ca'│
│ - confidence: 85 │
│ - warnings: [...] │
└──────────────────┘
```

### Decision Rules Example

```typescript
export function generateRecommendation(answers): Recommendation {
  const { workloadType, trafficPattern, scalingTrigger, needsScaleToZero } = answers;

  // Rule 1: Event-driven workloads -> KEDA
  if (scalingTrigger === 'queue-length' || trafficPattern === 'event-driven') {
    return {
      primary: 'keda',
      secondary: 'cluster-autoscaler',
      confidence: 90,
      reasoning: 'Your event-driven workload is a perfect fit for KEDA...',
    };
  }

  // Rule 2: Steady traffic with CPU trigger -> HPA
  if (trafficPattern === 'steady' && scalingTrigger === 'cpu') {
    return {
      primary: 'hpa',
      secondary: 'vpa',
      confidence: 85,
      reasoning: 'Standard HPA works well for steady CPU-based scaling...',
    };
  }

  // ... more rules
}
```

### Interview Connection
- Design a Recommendation System
- Design a Chatbot / Conversational AI
- Rule Engine vs ML-based Recommendations
- Decision Trees in Product Systems

---

## 9. Error Handling & Resilience Patterns

### Where in code
Throughout the codebase, especially `src/lib/news/`

### Pattern 1: Promise.allSettled (Partial Failure Tolerance)

```typescript
const [rssResults, devtoArticles, githubReleases] = await Promise.allSettled([
  fetchAllRSS(),
  fetchDevToArticles(),
  fetchGitHubReleases(),
]);

// Extract successful results, ignore failures
const all = [
  ...(rssResults.status === 'fulfilled' ? rssResults.value : []),
  ...(devtoArticles.status === 'fulfilled' ? devtoArticles.value : []),
  ...(githubReleases.status === 'fulfilled' ? githubReleases.value : []),
];
```

**vs Promise.all:** `Promise.all` rejects if ANY promise fails. `Promise.allSettled` waits for all to complete and reports individual results.

### Pattern 2: Silent Failure with Empty Array

```typescript
export async function fetchRSSFeed(source): Promise<NewsArticle[]> {
  try {
    const res = await fetch(source.url);
    if (!res.ok) return [];  // HTTP error -> empty array
    // ... parse
  } catch {
    return [];  // Network error -> empty array
  }
}
```

**When to use:** When one data source failing shouldn't break the entire feature.

### Pattern 3: Stale Data Fallback

```typescript
try {
  const data = await fetchPromise;
  cache.set(key, { data, expiresAt: now + ttlMs });
  return data;
} catch (err) {
  if (existing) {
    // Serve stale data with reduced TTL
    cache.set(key, { data: existing.data, expiresAt: now + ttlMs / 2 });
    return existing.data;
  }
  throw err;
}
```

**When to use:** When showing slightly old data is better than showing an error.

### Pattern 4: Structured Validation Results

```typescript
interface SqlValidationResult {
  isCorrect: boolean;
  matchType: 'exact' | 'alternative' | 'incorrect';
  feedback: string;
  results: Record<string, string | number>[];
}
```

**When to use:** When you need rich error information, not just pass/fail.

### Interview Connection
- Circuit Breaker Pattern
- Retry with Exponential Backoff
- Bulkhead Pattern
- Graceful Degradation vs Fail-Fast
- Design for Fault Tolerance

---

## 10. Component Architecture & Code Organization

### Where in code
Entire `src/` directory structure

### Architecture Pattern

```
src/
├── app/                    # Routes (pages + API)
│   ├── api/               # Server endpoints
│   ├── docs/              # Feature: Documentation
│   ├── visualize/         # Feature: Visualizations
│   ├── playground/        # Feature: Code sandbox
│   └── news/              # Feature: News feed
│
├── components/            # UI (presentation)
│   ├── layout/           # Shell: Header, Footer, Sidebar
│   ├── landing/          # Page: Landing sections
│   ├── visualizations/   # Feature: Simulation UI
│   ├── sandbox/          # Feature: Code editor UI
│   ├── assistant/        # Feature: AI chatbot UI
│   └── news/             # Feature: News cards UI
│
├── lib/                   # Business logic (no UI)
│   ├── simulator/        # Simulation engines
│   ├── sandbox/          # Validation engines
│   ├── news/             # Data aggregation
│   └── *-logic.ts        # Assistant decision trees
│
├── types/                 # TypeScript interfaces
└── hooks/                 # React hooks
```

### Key Principles Demonstrated

| Principle | How It's Applied |
|---|---|
| **Separation of Concerns** | UI in `components/`, logic in `lib/`, types in `types/` |
| **Feature-Based Organization** | Each feature (news, sandbox, simulator) has its own directory |
| **Colocation** | Feature components are near their feature pages |
| **Client Shell Pattern** | `ClientShell.tsx` wraps all pages with header, footer, assistant |
| **Layout Hierarchy** | Root layout -> Section layout -> Page (composability) |
| **Discriminated Unions** | `ScalingConfig = HPAConfig \| VPAConfig \| ...` for type safety |
| **Compound Components** | Tab containers manage selection, children render content |

### Interview Connection
- Frontend System Architecture
- Micro-Frontends
- Component Design Patterns
- Monorepo vs Polyrepo

---

# Part 3: Study Plan

## Week 1: Core DSA from This Project

| Day | Focus | Study File | Practice Problems |
|---|---|---|---|
| 1-2 | Hash Maps & Sets | `src/lib/news/cache.ts`, `src/lib/news/aggregator.ts` | LC 1, 217, 242, 146 |
| 3-4 | String Manipulation | `src/lib/news/rss-parser.ts`, `src/lib/sandbox/validation/sql-validator.ts` | LC 20, 394, 8, 49 |
| 5-6 | State Machines | `src/lib/simulator/deploymentLogic.ts` | LC 65, 393, design FSM |
| 7 | Review + practice | Re-read all files, attempt medium problems | Mock interview |

## Week 2: Advanced DSA + System Design Basics

| Day | Focus | Study File | Practice |
|---|---|---|---|
| 1-2 | Arrays & Sliding Window | `src/lib/simulator/scalingLogic.ts`, `useSimulation.ts` | LC 239, 283, 189, 341 |
| 3-4 | Caching Deep Dive | `src/lib/news/cache.ts` (study all patterns) | Design LRU Cache, discuss caching strategies |
| 5-6 | API & Pagination Design | `src/app/api/news/route.ts`, `NewsFeed.tsx` | Design a REST API, cursor vs offset pagination |
| 7 | Review + mock | Trace full news request flow | System design mock interview |

## Week 3: System Design Deep Dives

| Day | Focus | Study Files | Practice |
|---|---|---|---|
| 1-2 | News Aggregation Pipeline | All files in `src/lib/news/` | Design a News Feed system |
| 3-4 | Real-Time Systems | `useSimulation.ts`, `metricsEngine.ts` | Design a Monitoring System |
| 5-6 | Search & Recommendations | `assistant-logic.ts`, `topic-classifier.ts` | Design a Search Engine |
| 7 | Review + mock | Full architecture review | System design mock interview |

## Week 4: Integration & Mock Interviews

| Day | Focus | Activity |
|---|---|---|
| 1-2 | End-to-end tracing | Trace: user clicks news -> API -> cache -> RSS -> response -> render |
| 3-4 | Architecture explanation | Practice explaining this project's architecture in 5 minutes |
| 5-6 | "Design ScaleGuide" | Use this project as a system design question |
| 7 | Final mock | Full mock interview (1 DSA + 1 system design) |

---

# Part 4: Quick Reference Table

| File | DSA Topics | System Design Topics |
|---|---|---|
| `src/lib/news/cache.ts` | Hash Map, Memoization | Caching, TTL, Request Dedup |
| `src/lib/news/aggregator.ts` | Set dedup, Sorting, FlatMap | Data Pipeline, Fan-out/Fan-in |
| `src/lib/news/rss-parser.ts` | String parsing, Hashing, Cursor scan | ETL, External API Integration |
| `src/lib/news/topic-classifier.ts` | Dictionary lookup, Early exit | Keyword Classification |
| `src/lib/news/devto-client.ts` | -- | Third-party API Integration |
| `src/lib/news/github-client.ts` | -- | GitHub API, Release Tracking |
| `src/lib/simulator/scalingLogic.ts` | Arrays, State machines, Math | Autoscaling Algorithms |
| `src/lib/simulator/deploymentLogic.ts` | 6 State machines! | Deployment Strategy Patterns |
| `src/lib/simulator/postgresqlLogic.ts` | Prefix sum, Linear FSM | Connection Lifecycle |
| `src/lib/simulator/metricsEngine.ts` | Math algorithms | Metrics & Monitoring |
| `src/lib/simulator/useSimulation.ts` | Event queue, Sliding window | Event-Driven Architecture |
| `src/lib/assistant-logic.ts` | Hash map scoring, FSM | Recommendation Engine |
| `src/lib/sandbox/validation/sql-validator.ts` | String normalization | Input Validation |
| `src/lib/sandbox/validation/k8s-validator.ts` | -- | YAML Validation Pipeline |
| `src/lib/sandbox/k8s-resource-mapper.ts` | Tree traversal | Hierarchical Data Processing |
| `src/app/api/news/route.ts` | Filtering, Slicing | REST API, Pagination, Caching |
| `src/components/news/NewsFeed.tsx` | useCallback memoization | Infinite Scroll, IntersectionObserver |

---

> **Tip:** For each section, first read the actual project file to understand the implementation, then solve 2-3 related LeetCode problems. This dual approach reinforces both practical coding skills and algorithmic thinking.
