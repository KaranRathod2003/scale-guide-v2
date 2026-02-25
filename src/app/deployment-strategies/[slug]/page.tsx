import { notFound } from 'next/navigation';
import { getDeploymentDocBySlug, getAllDeploymentDocSlugs } from '@/lib/deployment-docs-content';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return getAllDeploymentDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDeploymentDocBySlug(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function DeploymentDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDeploymentDocBySlug(slug);
  if (!doc) notFound();

  return (
    <article>
      <h1 className="mb-2 text-3xl font-bold text-white">{doc.title}</h1>
      <p className="mb-8 text-zinc-300">{doc.description}</p>
      <div>{doc.content}</div>
    </article>
  );
}
