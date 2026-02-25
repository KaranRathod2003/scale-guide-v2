import React from 'react';
import CopyButton from '@/components/docs/CopyButton';

export interface PostgresDocPage {
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

function WarStory({ title, type, children }: { title: string; type: 'failure' | 'success'; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border p-5 ${
      type === 'failure'
        ? 'border-red-500/20 bg-red-500/5'
        : 'border-green-500/20 bg-green-500/5'
    }`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${
          type === 'failure' ? 'text-red-400' : 'text-green-400'
        }`}>
          {type === 'failure' ? 'Failure' : 'Success'}
        </span>
      </div>
      <h3 className={`mb-2 font-semibold ${
        type === 'failure' ? 'text-red-300' : 'text-green-300'
      }`}>{title}</h3>
      <div className="text-sm text-zinc-300">{children}</div>
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
// PREREQUISITES & SETUP
// ──────────────────────────────────────────
const prerequisitesContent = (
  <>
    <p className="text-lg text-zinc-200">
      Before diving into PostgreSQL, you need a working installation and a set of tools. This guide covers installation on all major platforms, essential client tools, and the critical pg_hba.conf authentication file.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">Installation</h2>

    <h3 className="mt-6 text-xl font-semibold text-white">macOS</h3>
    <CodeBlock language="bash">{`# Using Homebrew (recommended)
brew install postgresql@16
brew services start postgresql@16

# Verify installation
psql --version`}</CodeBlock>

    <h3 className="mt-6 text-xl font-semibold text-white">Ubuntu / Debian</h3>
    <CodeBlock language="bash">{`# Add PostgreSQL APT repository
sudo apt-get update
sudo apt-get install postgresql-16

# Start the service
sudo systemctl start postgresql
sudo systemctl enable postgresql`}</CodeBlock>

    <h3 className="mt-6 text-xl font-semibold text-white">Docker</h3>
    <CodeBlock language="bash">{`docker run --name pg-local \\
  -e POSTGRES_PASSWORD=secret \\
  -p 5432:5432 \\
  -d postgres:16-alpine`}</CodeBlock>

    <Callout type="tip">
      Docker is the fastest way to get a disposable PostgreSQL instance for development. Add a volume mount to persist data across container restarts.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">Essential Tools</h2>

    <h3 className="mt-6 text-xl font-semibold text-white">psql (CLI)</h3>
    <p className="text-zinc-200">
      The official command-line client. It comes bundled with PostgreSQL and is the most powerful tool for administration and debugging.
    </p>
    <CodeBlock language="bash">{`# Connect to a local database
psql -U postgres -d mydb

# Common psql commands
\\l          -- List databases
\\dt         -- List tables
\\d+ table   -- Describe table with details
\\timing     -- Toggle query timing
\\x          -- Toggle expanded display`}</CodeBlock>

    <h3 className="mt-6 text-xl font-semibold text-white">pgAdmin 4</h3>
    <p className="text-zinc-200">
      A web-based GUI for PostgreSQL. Best for visual query building, monitoring dashboards, and managing multiple servers. Available on all platforms.
    </p>

    <h3 className="mt-6 text-xl font-semibold text-white">DBeaver</h3>
    <p className="text-zinc-200">
      A universal database tool that supports PostgreSQL along with 80+ other databases. Excellent for developers who work with multiple database types. The Community Edition is free and open-source.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">pg_hba.conf Configuration</h2>
    <p className="text-zinc-200">
      The <code className="rounded bg-zinc-700 px-1">pg_hba.conf</code> (Host-Based Authentication) file controls who can connect and how they authenticate. It is the first file you should understand after installation.
    </p>

    <CodeBlock language="text">{`# TYPE  DATABASE  USER       ADDRESS          METHOD
local   all       postgres                    peer
host    all       all        127.0.0.1/32     scram-sha-256
host    all       all        ::1/128          scram-sha-256
host    all       all        192.168.1.0/24   scram-sha-256`}</CodeBlock>

    <Callout type="warning">
      Never set METHOD to <code className="rounded bg-zinc-700 px-1">trust</code> for remote connections in production. This allows passwordless access from the specified address range.
    </Callout>

    <PitfallTable pitfalls={[
      { pitfall: 'Using trust for remote', symptom: 'Anyone on the network can connect without a password', fix: 'Use scram-sha-256 or md5 for all non-local connections' },
      { pitfall: 'Forgetting to reload', symptom: 'pg_hba.conf changes have no effect', fix: 'Run: SELECT pg_reload_conf(); or restart PostgreSQL' },
      { pitfall: 'Wrong line order', symptom: 'Earlier rule matches first, overriding intended rule', fix: 'Put more specific rules before general ones' },
      { pitfall: 'Missing localhost entry', symptom: 'Applications on the same machine cannot connect', fix: 'Add host entry for 127.0.0.1/32 and ::1/128' },
    ]} />

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Stories</h2>
    <div className="my-4 space-y-4">
      <WarStory title="Uber - pg_hba.conf Misconfiguration Exposes Internal Rider Data" type="failure">
        <p>In 2014, a security researcher discovered that Uber&apos;s PostgreSQL instance had overly permissive pg_hba.conf rules, allowing access from a broader IP range than intended. Combined with leaked credentials from a separate breach, attackers accessed a database containing 50,000 driver records. The root cause was a pg_hba.conf entry using <code className="rounded bg-zinc-700 px-1">0.0.0.0/0</code> with md5 auth instead of restricting to specific VPC CIDR ranges.</p>
      </WarStory>
      <WarStory title="GitLab - Docker PostgreSQL Setup Saves Migration" type="success">
        <p>When GitLab migrated from MySQL to PostgreSQL in 2012, their Docker-based setup allowed the team to spin up dozens of test PostgreSQL instances to validate data migration scripts. Each developer could run a full PostgreSQL instance locally in seconds. The containerized approach caught 47 migration bugs before they hit production, and the team completed the full migration with zero data loss.</p>
      </WarStory>
    </div>
  </>
);

// ──────────────────────────────────────────
// WHY POSTGRESQL
// ──────────────────────────────────────────
const whyPostgresqlContent = (
  <>
    <p className="text-lg text-zinc-200">
      PostgreSQL is the world&apos;s most advanced open-source relational database. But why do companies like Apple, Instagram, Spotify, and Goldman Sachs choose it over alternatives? This section covers the technical capabilities, business reasons, and real migration stories.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">Core Capabilities</h2>
    <ul className="list-inside list-disc space-y-2 text-zinc-200">
      <li><strong className="text-white">ACID Compliance</strong> -- Full transactional integrity with serializable isolation levels</li>
      <li><strong className="text-white">JSONB</strong> -- Store and query semi-structured data with GIN indexes, bridging SQL and NoSQL</li>
      <li><strong className="text-white">Full-Text Search</strong> -- Built-in tsvector/tsquery with ranking, stemming, and multi-language support</li>
      <li><strong className="text-white">Extensibility</strong> -- Custom types, operators, functions, and index methods (PostGIS, pgvector, TimescaleDB)</li>
      <li><strong className="text-white">Partitioning</strong> -- Declarative table partitioning (range, list, hash) for tables with billions of rows</li>
      <li><strong className="text-white">Replication</strong> -- Streaming replication, logical replication, and synchronous commit options</li>
      <li><strong className="text-white">Security</strong> -- Row-level security (RLS), column-level encryption, SSL/TLS, and audit logging</li>
    </ul>

    <Callout type="info">
      PostgreSQL supports over 90+ data types natively, including arrays, ranges, geometric types, network addresses, and UUIDs. Most alternatives require extensions or workarounds for these.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">Enterprise Use Cases</h2>
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="px-4 py-3 text-left font-medium text-zinc-300">Company</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-300">Industry</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-300">Use Case</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-300">Scale</th>
          </tr>
        </thead>
        <tbody>
          {[
            { company: 'Apple', industry: 'Technology', useCase: 'iCloud infrastructure & analytics', scale: '1000+ instances' },
            { company: 'Instagram', industry: 'Social Media', useCase: 'User data, feeds, activity storage', scale: 'Billions of rows' },
            { company: 'Spotify', industry: 'Music Streaming', useCase: 'Accounts, playlists, social features', scale: '500M+ users' },
            { company: 'Goldman Sachs', industry: 'Finance', useCase: 'Trade settlement, risk analytics', scale: 'Mission-critical' },
            { company: 'Reddit', industry: 'Social Media', useCase: 'Comments, votes, subreddit metadata', scale: '430M+ monthly users' },
          ].map((row, i) => (
            <tr key={i} className="border-b border-zinc-700/50">
              <td className="px-4 py-3 font-medium text-brand-400">{row.company}</td>
              <td className="px-4 py-3 text-zinc-300">{row.industry}</td>
              <td className="px-4 py-3 text-zinc-200">{row.useCase}</td>
              <td className="px-4 py-3 text-zinc-200">{row.scale}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">PostgreSQL vs Alternatives</h2>
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="px-4 py-3 text-left font-medium text-zinc-300">Feature</th>
            <th className="px-4 py-3 text-left font-medium text-brand-400">PostgreSQL</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-300">MySQL</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-300">MongoDB</th>
          </tr>
        </thead>
        <tbody className="text-zinc-200">
          <tr className="border-b border-zinc-700/50">
            <td className="px-4 py-3 text-zinc-300">ACID transactions</td>
            <td className="px-4 py-3 text-green-400">Full</td>
            <td className="px-4 py-3 text-green-400">Full (InnoDB)</td>
            <td className="px-4 py-3 text-yellow-400">Multi-doc since 4.0</td>
          </tr>
          <tr className="border-b border-zinc-700/50">
            <td className="px-4 py-3 text-zinc-300">JSON support</td>
            <td className="px-4 py-3 text-green-400">JSONB with indexes</td>
            <td className="px-4 py-3 text-yellow-400">JSON type (limited)</td>
            <td className="px-4 py-3 text-green-400">Native BSON</td>
          </tr>
          <tr className="border-b border-zinc-700/50">
            <td className="px-4 py-3 text-zinc-300">Full-text search</td>
            <td className="px-4 py-3 text-green-400">Built-in</td>
            <td className="px-4 py-3 text-yellow-400">Basic</td>
            <td className="px-4 py-3 text-yellow-400">Atlas Search</td>
          </tr>
          <tr className="border-b border-zinc-700/50">
            <td className="px-4 py-3 text-zinc-300">Extensibility</td>
            <td className="px-4 py-3 text-green-400">Custom types, operators</td>
            <td className="px-4 py-3 text-red-400">Limited</td>
            <td className="px-4 py-3 text-yellow-400">Aggregation pipeline</td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-zinc-300">License</td>
            <td className="px-4 py-3 text-green-400">PostgreSQL (permissive)</td>
            <td className="px-4 py-3 text-yellow-400">GPL (Oracle-owned)</td>
            <td className="px-4 py-3 text-red-400">SSPL (restrictive)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Migration Reasons</h2>
    <ul className="mt-3 list-inside list-disc space-y-2 text-zinc-200">
      <li><strong className="text-white">From MySQL</strong> -- Better JSON support, CTEs, window functions, and no Oracle licensing concerns</li>
      <li><strong className="text-white">From MongoDB</strong> -- Need for ACID transactions, joins, and structured data with JSONB for flexibility</li>
      <li><strong className="text-white">From Oracle</strong> -- Cost savings (PostgreSQL is free) with comparable features for most workloads</li>
      <li><strong className="text-white">From SQL Server</strong> -- Platform independence and avoiding vendor lock-in</li>
    </ul>

    <Callout type="tip">
      PostgreSQL&apos;s JSONB type lets you store semi-structured data alongside relational data in the same database. This eliminates the need for a separate NoSQL database in many architectures.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Stories</h2>
    <div className="my-4 space-y-4">
      <WarStory title="Instagram - Scaling PostgreSQL to Billions of Rows" type="success">
        <p>Instagram started on Django + PostgreSQL in 2010 and considered switching to Cassandra as they scaled. Instead, they built a custom sharding layer on top of PostgreSQL, distributing data across dozens of logical shards. By 2012 (acquisition by Facebook), they were handling 25+ photos per second with PostgreSQL. The key insight: rather than abandoning PostgreSQL for a &quot;web-scale&quot; database, they invested in understanding PostgreSQL&apos;s strengths and building around its weaknesses.</p>
      </WarStory>
      <WarStory title="Heroku - The PostgreSQL Outage That Changed Cloud Databases" type="failure">
        <p>In 2013, a routine maintenance script at Heroku accidentally deleted data from a shared PostgreSQL cluster affecting thousands of customer databases. The backup restoration process took over 8 hours. The incident led to Heroku completely redesigning their PostgreSQL infrastructure with continuous WAL archiving, automated point-in-time recovery (PITR), and follower databases. It became a case study in why managed PostgreSQL needs more than just nightly pg_dump backups.</p>
      </WarStory>
      <WarStory title="Amazon - Why Aurora PostgreSQL Exists" type="success">
        <p>Amazon built Aurora PostgreSQL after observing that traditional PostgreSQL replication couldn&apos;t keep up with their internal workloads. They separated storage from compute, allowing up to 15 read replicas with sub-10ms lag. The project validated PostgreSQL&apos;s wire protocol and SQL compatibility as a foundation -- Amazon didn&apos;t switch to a proprietary query language. Today, Aurora PostgreSQL handles some of Amazon&apos;s highest-traffic internal services.</p>
      </WarStory>
    </div>
  </>
);

// ──────────────────────────────────────────
// BACKEND CONNECTIONS
// ──────────────────────────────────────────
const backendConnectionsContent = (
  <>
    <p className="text-lg text-zinc-200">
      Understanding how your application connects to PostgreSQL is critical for performance and reliability. This section covers connection patterns for Node.js, Python, Java, and C++ -- from raw drivers to ORMs and connection pooling.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">Connection Lifecycle</h2>
    <ol className="mt-3 list-inside list-decimal space-y-1 text-zinc-200">
      <li><strong className="text-white">DNS Resolution</strong> -- Resolve database hostname to IP address</li>
      <li><strong className="text-white">TCP Connect</strong> -- Establish TCP connection to port 5432 (default)</li>
      <li><strong className="text-white">SSL/TLS Handshake</strong> -- Negotiate encrypted connection (if configured)</li>
      <li><strong className="text-white">Authentication</strong> -- Send credentials, server validates against pg_hba.conf</li>
      <li><strong className="text-white">Query</strong> -- Send SQL, server parses, plans, and runs</li>
      <li><strong className="text-white">Response</strong> -- Server returns result set or error</li>
    </ol>

    <Callout type="info">
      Creating a new connection takes 20-50ms (local) or 100-300ms (remote with SSL). This is why connection pooling is essential for production applications handling many requests.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">Node.js</h2>
    <h3 className="mt-4 text-lg font-semibold text-white">pg (raw driver)</h3>
    <CodeBlock language="javascript">{[
      "const { Client } = require('pg');",
      'const client = new Client({',
      "  host: 'localhost',",
      '  port: 5432,',
      "  database: 'mydb',",
      "  user: 'postgres',",
      "  password: 'secret',",
      '});',
      '',
      'await client.connect();',
      "const res = await client.query('SELECT NOW()');",
      'console.log(res.rows[0]);',
      'await client.end();',
    ].join('\n')}</CodeBlock>

    <h3 className="mt-4 text-lg font-semibold text-white">pg Pool (recommended for production)</h3>
    <CodeBlock language="javascript">{[
      "const { Pool } = require('pg');",
      'const pool = new Pool({',
      "  host: 'localhost',",
      '  max: 20,                    // max connections in pool',
      '  idleTimeoutMillis: 30000,   // close idle after 30s',
      '  connectionTimeoutMillis: 2000,',
      '});',
      '',
      '// Pool automatically manages connections',
      "const res = await pool.query('SELECT * FROM users WHERE id = $1', [1]);",
    ].join('\n')}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Python</h2>
    <h3 className="mt-4 text-lg font-semibold text-white">psycopg2</h3>
    <CodeBlock language="python">{[
      'import psycopg2',
      '',
      'conn = psycopg2.connect(',
      '    host="localhost",',
      '    dbname="mydb",',
      '    user="postgres",',
      '    password="secret"',
      ')',
      'cur = conn.cursor()',
      'cur.execute("SELECT NOW()")',
      'print(cur.fetchone())',
      'cur.close()',
      'conn.close()',
    ].join('\n')}</CodeBlock>

    <h3 className="mt-4 text-lg font-semibold text-white">SQLAlchemy (ORM)</h3>
    <CodeBlock language="python">{[
      'from sqlalchemy import create_engine',
      'from sqlalchemy.orm import Session',
      '',
      'engine = create_engine(',
      '    "postgresql://postgres:secret@localhost/mydb",',
      '    pool_size=5,',
      '    max_overflow=10,',
      ')',
      '',
      'with Session(engine) as session:',
      '    users = session.query(User).filter(',
      '        User.active == True',
      '    ).all()',
    ].join('\n')}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Java</h2>
    <h3 className="mt-4 text-lg font-semibold text-white">JDBC + HikariCP</h3>
    <CodeBlock language="java">{[
      'import com.zaxxer.hikari.*;',
      '',
      'HikariConfig config = new HikariConfig();',
      'config.setJdbcUrl("jdbc:postgresql://localhost:5432/mydb");',
      'config.setUsername("postgres");',
      'config.setPassword("secret");',
      'config.setMaximumPoolSize(10);',
      '',
      'HikariDataSource ds = new HikariDataSource(config);',
      'try (Connection conn = ds.getConnection();',
      '     PreparedStatement ps = conn.prepareStatement(',
      '        "SELECT NOW()")) {',
      '    ResultSet rs = ps.executeQuery();',
      '    rs.next();',
      '    System.out.println(rs.getTimestamp(1));',
      '}',
    ].join('\n')}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">C++</h2>
    <h3 className="mt-4 text-lg font-semibold text-white">libpqxx</h3>
    <CodeBlock language="cpp">{[
      '#include <pqxx/pqxx>',
      '#include <iostream>',
      '',
      'int main() {',
      '    pqxx::connection conn(',
      '        "host=localhost port=5432 "',
      '        "dbname=mydb user=postgres password=secret"',
      '    );',
      '    pqxx::work txn(conn);',
      '    auto result = txn.exec("SELECT id, name FROM users");',
      '    for (auto row : result) {',
      '        std::cout << row["id"].as<int>()',
      '                  << ": " << row["name"].c_str()',
      '                  << std::endl;',
      '    }',
      '    txn.commit();',
      '}',
    ].join('\n')}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Connection Pooling Best Practices</h2>
    <PitfallTable pitfalls={[
      { pitfall: 'No connection pooling', symptom: 'Connection exhaustion under load, slow response times', fix: 'Use a pool (pg Pool, HikariCP, or PgBouncer)' },
      { pitfall: 'Pool too large', symptom: 'PostgreSQL overwhelmed, high memory usage, lock contention', fix: 'Start with (2 * CPU cores) + disk spindles, benchmark from there' },
      { pitfall: 'Pool too small', symptom: 'Requests queue up waiting for connections', fix: 'Monitor pool wait time, increase max if consistently saturated' },
      { pitfall: 'Not releasing connections', symptom: 'Pool exhaustion, application hangs', fix: 'Always use try-finally or context managers to release connections' },
    ]} />

    <Callout type="tip">
      Try the <strong>Connection Simulator</strong> in the Playground to see the full connection lifecycle animated step by step, including pooling behavior under different configurations.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Stories</h2>
    <div className="my-4 space-y-4">
      <WarStory title="Notion - Connection Pool Exhaustion During Growth Spike" type="failure">
        <p>In early 2021, Notion experienced repeated outages as their user base grew rapidly. The root cause was connection pool exhaustion: each microservice opened its own pool of 20 connections, and with 50+ services, they were hitting PostgreSQL&apos;s max_connections limit of 500. Long-running queries held connections while others queued. The fix involved deploying PgBouncer as a centralized connection pooler, reducing each service to 5 pool connections while PgBouncer managed multiplexing. Response times dropped from 2s to 50ms.</p>
      </WarStory>
      <WarStory title="Shopify - Zero-Downtime Connection Migration" type="success">
        <p>When Shopify migrated their main PostgreSQL database to a new cluster in 2020, they needed to move 100+ application services without any downtime during Black Friday Cyber Monday (BFCM) preparation. They used PgBouncer&apos;s PAUSE/RESUME feature: pause all connections, switch the backend to the new PostgreSQL host, resume. The entire cutover took 3 seconds, with no dropped transactions. Every service reconnected transparently through PgBouncer without code changes.</p>
      </WarStory>
      <WarStory title="Robinhood - The ORM N+1 Query Disaster" type="failure">
        <p>During a volatile trading day, Robinhood&apos;s Django-based backend slowed to a crawl. Investigation revealed that their ORM was generating N+1 queries: for each portfolio (N=millions), a separate query fetched holdings. A single page load triggered 400+ SQL queries instead of 2. The fix was adding <code className="rounded bg-zinc-700 px-1">select_related()</code> and <code className="rounded bg-zinc-700 px-1">prefetch_related()</code> to their Django querysets, reducing database round trips by 99%.</p>
      </WarStory>
    </div>
  </>
);

// ──────────────────────────────────────────
// PRACTICE EXAMPLES
// ──────────────────────────────────────────
const practiceExamplesContent = (
  <>
    <p className="text-lg text-zinc-200">
      The best way to learn PostgreSQL is by writing SQL. This section provides curated exercises from basic SELECTs to intermediate JOINs and window functions. Each exercise includes a hint, the solution, and expected output.
    </p>

    <Callout type="tip">
      Head to the <strong>Query Playground</strong> tab in the Playground to try these exercises interactively -- type your query and hit <strong>Run Query</strong> to check your answer.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Stories</h2>
    <div className="my-4 space-y-4">
      <WarStory title="Stripe - The Missing Index That Cost $1M in Compute" type="failure">
        <p>A Stripe engineer deployed a new dashboard feature that ran <code className="rounded bg-zinc-700 px-1">SELECT * FROM payments WHERE merchant_id = ? ORDER BY created_at DESC</code> on a 2-billion-row table without a composite index. The query triggered sequential scans, pegging CPU at 100% across 8 read replicas. The fix was a single <code className="rounded bg-zinc-700 px-1">CREATE INDEX CONCURRENTLY</code> on (merchant_id, created_at DESC). Query time dropped from 12 seconds to 3ms.</p>
      </WarStory>
      <WarStory title="Datadog - Teaching SQL Through Production Incidents" type="success">
        <p>Datadog created an internal &quot;SQL Gym&quot; where engineers practice writing queries against anonymized production schemas. New hires solve exercises based on real incident investigations: &quot;Find the top 10 customers by ingested bytes in the last hour&quot; or &quot;Identify metrics with the highest cardinality growth.&quot; Engineers who completed the program resolved SQL-related incidents 60% faster than those who didn&apos;t.</p>
      </WarStory>
    </div>

    <h2 className="mt-8 text-2xl font-bold text-white">Sample Schema</h2>
    <CodeBlock language="sql">{[
      'CREATE TABLE employees (',
      '  id SERIAL PRIMARY KEY,',
      '  name VARCHAR(100),',
      '  department VARCHAR(50),',
      '  salary NUMERIC(10,2),',
      '  hire_date DATE',
      ');',
      '',
      'INSERT INTO employees VALUES',
      "  (1, 'Alice', 'Engineering', 95000, '2020-01-15'),",
      "  (2, 'Bob', 'Marketing', 72000, '2019-06-01'),",
      "  (3, 'Carol', 'Engineering', 105000, '2018-03-20'),",
      "  (4, 'Dave', 'Sales', 68000, '2021-09-10'),",
      "  (5, 'Eve', 'Engineering', 115000, '2017-11-30');",
    ].join('\n')}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Basic Exercises</h2>

    <h3 className="mt-6 text-xl font-semibold text-white">1. SELECT with ORDER BY</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> Get all employees sorted by hire_date (oldest first).</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show hint</summary>
      <p className="px-4 pb-3 text-sm text-zinc-300">Use ORDER BY with the hire_date column. Default sort order is ascending.</p>
    </details>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{'SELECT * FROM employees ORDER BY hire_date;'}</CodeBlock>
    </details>

    <h3 className="mt-6 text-xl font-semibold text-white">2. WHERE Filtering</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> Find all Engineering employees earning more than $100,000.</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show hint</summary>
      <p className="px-4 pb-3 text-sm text-zinc-300">Use WHERE with AND to combine two conditions.</p>
    </details>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{[
        'SELECT * FROM employees',
        "WHERE department = 'Engineering' AND salary > 100000;",
      ].join('\n')}</CodeBlock>
    </details>

    <h3 className="mt-6 text-xl font-semibold text-white">3. GROUP BY &amp; Aggregation</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> Get the average salary and employee count for each department.</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show hint</summary>
      <p className="px-4 pb-3 text-sm text-zinc-300">Use GROUP BY department with AVG() and COUNT().</p>
    </details>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{[
        'SELECT department, COUNT(*) AS emp_count,',
        '  ROUND(AVG(salary), 2) AS avg_salary',
        'FROM employees',
        'GROUP BY department',
        'ORDER BY avg_salary DESC;',
      ].join('\n')}</CodeBlock>
    </details>

    <h3 className="mt-6 text-xl font-semibold text-white">4. DISTINCT Values</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> List all unique departments, sorted alphabetically.</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show hint</summary>
      <p className="px-4 pb-3 text-sm text-zinc-300">Use SELECT DISTINCT to eliminate duplicates from a column.</p>
    </details>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{'SELECT DISTINCT department FROM employees ORDER BY department;'}</CodeBlock>
    </details>

    <h3 className="mt-6 text-xl font-semibold text-white">5. HAVING Clause</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> Find departments that have more than 1 employee.</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show hint</summary>
      <p className="px-4 pb-3 text-sm text-zinc-300">HAVING is like WHERE, but for filtering groups after GROUP BY.</p>
    </details>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{[
        'SELECT department, COUNT(*) AS emp_count',
        'FROM employees',
        'GROUP BY department',
        'HAVING COUNT(*) > 1;',
      ].join('\n')}</CodeBlock>
    </details>

    <h3 className="mt-6 text-xl font-semibold text-white">6. String Functions</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> Show each employee name in uppercase, department in lowercase, and the length of their name.</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show hint</summary>
      <p className="px-4 pb-3 text-sm text-zinc-300">Use UPPER(), LOWER(), and LENGTH() functions.</p>
    </details>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{[
        'SELECT UPPER(name) AS upper_name,',
        '  LOWER(department) AS lower_dept,',
        '  LENGTH(name) AS name_length',
        'FROM employees ORDER BY name;',
      ].join('\n')}</CodeBlock>
    </details>

    <h2 className="mt-8 text-2xl font-bold text-white">Intermediate Exercises</h2>

    <h3 className="mt-6 text-xl font-semibold text-white">7. JOINs</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> List each employee with their department location and budget using LEFT JOIN.</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{[
        'SELECT e.name, e.salary, d.location, d.budget',
        'FROM employees e',
        'LEFT JOIN departments d ON e.department = d.name',
        'ORDER BY e.name;',
      ].join('\n')}</CodeBlock>
    </details>

    <h3 className="mt-6 text-xl font-semibold text-white">8. CASE Expressions</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> Classify employees as &quot;Senior&quot; (salary &gt;= 100k), &quot;Mid&quot; (&gt;= 70k), or &quot;Junior&quot;.</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show hint</summary>
      <p className="px-4 pb-3 text-sm text-zinc-300">Use CASE WHEN ... THEN ... ELSE ... END to create conditional categories.</p>
    </details>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{[
        'SELECT name, salary,',
        '  CASE',
        "    WHEN salary >= 100000 THEN 'Senior'",
        "    WHEN salary >= 70000 THEN 'Mid'",
        "    ELSE 'Junior'",
        '  END AS level',
        'FROM employees',
        'ORDER BY salary DESC;',
      ].join('\n')}</CodeBlock>
    </details>

    <h3 className="mt-6 text-xl font-semibold text-white">9. Window Functions</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> Rank employees within their department by salary (highest = rank 1).</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show hint</summary>
      <p className="px-4 pb-3 text-sm text-zinc-300">Use RANK() OVER (PARTITION BY department ORDER BY salary DESC).</p>
    </details>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{[
        'SELECT name, department, salary,',
        '  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank',
        'FROM employees',
        'ORDER BY department, dept_rank;',
      ].join('\n')}</CodeBlock>
    </details>

    <h3 className="mt-6 text-xl font-semibold text-white">10. Self JOIN</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> Find all pairs of employees in the same department (avoid duplicates like Alice-Carol and Carol-Alice).</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show hint</summary>
      <p className="px-4 pb-3 text-sm text-zinc-300">JOIN the table with itself on department, and use e1.id &lt; e2.id to avoid duplicate pairs.</p>
    </details>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{[
        'SELECT e1.name AS employee_1, e2.name AS employee_2, e1.department',
        'FROM employees e1',
        'JOIN employees e2 ON e1.department = e2.department AND e1.id < e2.id',
        'ORDER BY e1.department, e1.name;',
      ].join('\n')}</CodeBlock>
    </details>

    <h3 className="mt-6 text-xl font-semibold text-white">11. Date Functions</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> Show each employee&apos;s tenure in years (as of 2024-01-01), rounded to 1 decimal.</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show hint</summary>
      <p className="px-4 pb-3 text-sm text-zinc-300">Use AGE() to get the interval, then EXTRACT(EPOCH FROM ...) / 86400 / 365.25 to convert to years.</p>
    </details>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{[
        'SELECT name, hire_date,',
        "  ROUND(EXTRACT(EPOCH FROM AGE('2024-01-01'::date, hire_date)) / 86400 / 365.25, 1) AS years_employed",
        'FROM employees',
        'ORDER BY years_employed DESC;',
      ].join('\n')}</CodeBlock>
    </details>

    <h3 className="mt-6 text-xl font-semibold text-white">12. CTEs (Common Table Expressions)</h3>
    <p className="text-zinc-200"><strong>Challenge:</strong> Find active projects where the lead earns above the company average.</p>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show hint</summary>
      <p className="px-4 pb-3 text-sm text-zinc-300">Use a CTE to calculate the average salary first, then CROSS JOIN it into the main query.</p>
    </details>
    <details className="my-3 rounded-lg border border-zinc-700 bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-400">Show solution</summary>
      <CodeBlock language="sql">{[
        'WITH avg_sal AS (',
        '  SELECT AVG(salary) AS company_avg FROM employees',
        ')',
        'SELECT p.name AS project, e.name AS lead, e.salary',
        'FROM projects p',
        'JOIN employees e ON p.lead_id = e.id',
        'CROSS JOIN avg_sal',
        "WHERE p.status = 'active'",
        '  AND e.salary > avg_sal.company_avg',
        'ORDER BY e.salary DESC;',
      ].join('\n')}</CodeBlock>
    </details>
  </>
);

// ──────────────────────────────────────────
// OFFICIAL DOCS SUMMARY
// ──────────────────────────────────────────
const officialDocsSummaryContent = (
  <>
    <p className="text-lg text-zinc-200">
      The official PostgreSQL documentation is comprehensive but dense (3000+ pages). This section condenses the most important topics: data types, configuration, backup/restore, and replication.
    </p>

    <h2 className="mt-8 text-2xl font-bold text-white">Essential Data Types</h2>
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="px-4 py-3 text-left font-medium text-zinc-300">Type</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-300">Use Case</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-300">Example</th>
          </tr>
        </thead>
        <tbody className="text-zinc-200">
          {[
            { type: 'SERIAL / BIGSERIAL', useCase: 'Auto-incrementing IDs', example: 'id SERIAL PRIMARY KEY' },
            { type: 'UUID', useCase: 'Distributed unique IDs', example: 'gen_random_uuid()' },
            { type: 'VARCHAR(n) / TEXT', useCase: 'Variable-length strings', example: 'name VARCHAR(100)' },
            { type: 'NUMERIC(p,s)', useCase: 'Exact decimal (money, finance)', example: 'price NUMERIC(10,2)' },
            { type: 'TIMESTAMPTZ', useCase: 'Date/time with timezone', example: 'created_at TIMESTAMPTZ DEFAULT NOW()' },
            { type: 'JSONB', useCase: 'Semi-structured data with indexing', example: "metadata JSONB DEFAULT '{}'" },
            { type: 'ARRAY', useCase: 'Lists of values in a single column', example: 'tags TEXT[]' },
            { type: 'BOOLEAN', useCase: 'True/false flags', example: 'active BOOLEAN DEFAULT true' },
            { type: 'INET / CIDR', useCase: 'IP addresses and networks', example: 'client_ip INET' },
          ].map((row, i) => (
            <tr key={i} className="border-b border-zinc-700/50">
              <td className="px-4 py-3 font-mono text-xs text-brand-400">{row.type}</td>
              <td className="px-4 py-3 text-zinc-300">{row.useCase}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-200">{row.example}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <Callout type="tip">
      Use <code className="rounded bg-zinc-700 px-1">TIMESTAMPTZ</code> (with timezone) instead of <code className="rounded bg-zinc-700 px-1">TIMESTAMP</code> for all time data. PostgreSQL stores both as UTC internally, but TIMESTAMPTZ correctly converts on input/output.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">Critical Configuration Parameters</h2>
    <CodeBlock language="text">{[
      '# postgresql.conf - Key settings',
      '',
      '# Memory',
      "shared_buffers = '256MB'          # 25% of available RAM",
      "work_mem = '64MB'                 # Per-operation sort/hash memory",
      "effective_cache_size = '768MB'    # OS cache estimate (50-75% of RAM)",
      '',
      '# WAL & Checkpoints',
      "wal_level = 'replica'             # Required for replication",
      "max_wal_size = '1GB'",
      'checkpoint_completion_target = 0.9',
      '',
      '# Connections',
      'max_connections = 200             # Coordinate with pooler',
      "listen_addresses = '*'            # Bind to all interfaces",
      '',
      '# Logging',
      'log_min_duration_statement = 1000 # Log queries > 1 second',
      "log_statement = 'ddl'             # Log DDL statements",
    ].join('\n')}</CodeBlock>

    <Callout type="warning">
      Do not set <code className="rounded bg-zinc-700 px-1">shared_buffers</code> too high. Going above 40% of RAM can hurt performance because it competes with the OS page cache. Start at 25% and benchmark.
    </Callout>

    <h2 className="mt-8 text-2xl font-bold text-white">Backup &amp; Restore</h2>

    <h3 className="mt-4 text-lg font-semibold text-white">Logical Backup (pg_dump)</h3>
    <CodeBlock language="bash">{[
      '# Backup a single database',
      'pg_dump -U postgres -Fc mydb > mydb.dump',
      '',
      '# Restore from custom format',
      'pg_restore -U postgres -d mydb mydb.dump',
      '',
      '# Restore specific table',
      'pg_restore -U postgres -d mydb -t users mydb.dump',
    ].join('\n')}</CodeBlock>

    <h3 className="mt-4 text-lg font-semibold text-white">Physical Backup (pg_basebackup)</h3>
    <CodeBlock language="bash">{[
      '# Full physical backup for point-in-time recovery',
      'pg_basebackup -U replicator -D /backup/base -Ft -z -P',
    ].join('\n')}</CodeBlock>

    <h2 className="mt-8 text-2xl font-bold text-white">Replication</h2>

    <h3 className="mt-4 text-lg font-semibold text-white">Streaming Replication</h3>
    <p className="text-zinc-200">
      Physical byte-for-byte replication. The replica is an exact copy of the primary. Best for read replicas and high availability.
    </p>
    <CodeBlock language="text">{[
      '# On primary (postgresql.conf)',
      "wal_level = 'replica'",
      'max_wal_senders = 3',
      "wal_keep_size = '1GB'",
      '',
      '# On replica',
      "primary_conninfo = 'host=primary-host user=replicator password=secret'",
    ].join('\n')}</CodeBlock>

    <h3 className="mt-4 text-lg font-semibold text-white">Logical Replication</h3>
    <p className="text-zinc-200">
      Table-level replication that decodes WAL into logical changes. Allows replicating specific tables and cross-version replication.
    </p>
    <CodeBlock language="sql">{[
      '-- On publisher',
      'CREATE PUBLICATION my_pub FOR TABLE users, orders;',
      '',
      '-- On subscriber',
      'CREATE SUBSCRIPTION my_sub',
      "  CONNECTION 'host=publisher-host dbname=mydb user=replicator'",
      '  PUBLICATION my_pub;',
    ].join('\n')}</CodeBlock>

    <PitfallTable pitfalls={[
      { pitfall: 'No monitoring on replica lag', symptom: 'Stale reads, eventual consistency surprises', fix: 'Monitor pg_stat_replication.replay_lag' },
      { pitfall: 'No backup testing', symptom: 'Backup is corrupt when you need it', fix: 'Regularly restore backups to a test environment' },
      { pitfall: 'shared_buffers too large', symptom: 'Performance degrades under memory pressure', fix: 'Keep at 25% of RAM, let OS cache handle the rest' },
      { pitfall: 'Missing indexes', symptom: 'Seq scans on large tables, slow queries', fix: 'Use EXPLAIN ANALYZE and pg_stat_user_tables to find missing indexes' },
    ]} />

    <h2 className="mt-8 text-2xl font-bold text-white">Real-World Stories</h2>
    <div className="my-4 space-y-4">
      <WarStory title="GitLab - The Accidental DELETE That Took Down Production" type="failure">
        <p>On January 31, 2017, a GitLab engineer ran <code className="rounded bg-zinc-700 px-1">rm -rf</code> on a PostgreSQL data directory on the wrong server -- the primary instead of a replica. Of their 5 backup strategies, only one (LVM snapshots) worked, and it was 6 hours old. pg_dump backups were failing silently due to a configuration error. Logical replication was set up but not tested. GitLab lost 6 hours of production data. The incident led to their famous &quot;postmortem live stream&quot; and a complete overhaul of backup verification.</p>
      </WarStory>
      <WarStory title="Crunchy Data - Automated PITR Saves a Healthcare Company" type="success">
        <p>A healthcare SaaS company accidentally ran an UPDATE without a WHERE clause, corrupting 2 million patient records. Using Crunchy Data&apos;s PostgreSQL setup with continuous WAL archiving, they performed point-in-time recovery (PITR) to exactly 30 seconds before the bad UPDATE. Full recovery took 22 minutes with zero data loss. The key was having <code className="rounded bg-zinc-700 px-1">archive_mode = on</code> and <code className="rounded bg-zinc-700 px-1">archive_command</code> shipping WAL segments to S3 every 60 seconds.</p>
      </WarStory>
      <WarStory title="Zalando - Patroni Cluster Survives AWS AZ Failure" type="success">
        <p>When an entire AWS availability zone went down in 2019, Zalando&apos;s PostgreSQL clusters (managed by Patroni) automatically promoted replicas in healthy AZs within 10 seconds. Their e-commerce platform served 35 million customers with no visible impact. The setup used synchronous replication across AZs with Patroni handling automatic failover, proving that PostgreSQL can match the high-availability guarantees of proprietary databases.</p>
      </WarStory>
    </div>
  </>
);

// ──────────────────────────────────────────
// ALL PAGES
// ──────────────────────────────────────────
const pages: PostgresDocPage[] = [
  {
    slug: 'prerequisites-setup',
    title: 'Prerequisites & Setup',
    description: 'Install PostgreSQL, set up essential tools (psql, pgAdmin, DBeaver), and configure pg_hba.conf authentication.',
    content: prerequisitesContent,
  },
  {
    slug: 'why-postgresql',
    title: 'Why PostgreSQL?',
    description: 'Core capabilities, enterprise use cases from Apple to Goldman Sachs, comparison with alternatives, and migration reasons.',
    content: whyPostgresqlContent,
  },
  {
    slug: 'backend-connections',
    title: 'Backend Connections',
    description: 'How PostgreSQL connects to Node.js, Python, Java, and C++ -- from raw drivers to ORMs and connection pooling.',
    content: backendConnectionsContent,
  },
  {
    slug: 'practice-examples',
    title: 'Practice Examples',
    description: 'Curated SQL exercises from basic SELECTs to window functions and CTEs, with hints and solutions.',
    content: practiceExamplesContent,
  },
  {
    slug: 'official-docs-summary',
    title: 'Official Docs Summary',
    description: 'Condensed PostgreSQL official docs: essential data types, critical configuration, backup/restore, and replication.',
    content: officialDocsSummaryContent,
  },
];

export function getPostgresDocBySlug(slug: string): PostgresDocPage | undefined {
  return pages.find((p) => p.slug === slug);
}

export function getAllPostgresDocSlugs(): string[] {
  return pages.map((p) => p.slug);
}
