import type { Metadata } from 'next';
import PostgreSQLVisualizePage from './PostgreSQLVisualizePage';

export const metadata: Metadata = {
  title: 'PostgreSQL Playground',
  description: 'Interactive PostgreSQL tools: connection simulator, query practice, and connection pool visualizer.',
};

export default function Page() {
  return <PostgreSQLVisualizePage />;
}
