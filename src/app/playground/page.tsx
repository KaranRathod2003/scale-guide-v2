import type { Metadata } from 'next';
import SandboxPlayground from '@/components/sandbox/SandboxPlayground';

export const metadata: Metadata = {
  title: 'Code Sandbox | ScaleGuide',
  description: 'Practice SQL queries, Kubernetes manifests, and deployment configurations with instant validation and feedback.',
};

export default async function PlaygroundPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  return <SandboxPlayground initialTab={params.tab} />;
}
