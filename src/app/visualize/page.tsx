import type { Metadata } from 'next';
import VisualizePage from './VisualizePage';

export const metadata: Metadata = {
  title: 'Interactive Visualizations',
  description: 'Watch Kubernetes autoscaling in action. Trigger traffic spikes and see pods scale in real-time.',
};

export default function Page() {
  return <VisualizePage />;
}
