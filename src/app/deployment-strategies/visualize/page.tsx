import type { Metadata } from 'next';
import DeploymentVisualizePage from './DeploymentVisualizePage';

export const metadata: Metadata = {
  title: 'Deployment Strategy Visualizations',
  description: 'Watch deployment strategies in action: Blue-Green, Canary, Rolling Update, Recreate, A/B Testing, and Shadow deployments.',
};

export default function Page() {
  return <DeploymentVisualizePage />;
}
