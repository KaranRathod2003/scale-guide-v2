import { notFound } from 'next/navigation';
import { getPostgresDocBySlug, getAllPostgresDocSlugs } from '@/lib/postgresql-docs-content';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return getAllPostgresDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getPostgresDocBySlug(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function PostgresDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getPostgresDocBySlug(slug);
  if (!doc) notFound();

  return (
    <article>
      <h1 className="mb-2 text-3xl font-bold text-white">{doc.title}</h1>
      <p className="mb-8 text-zinc-300">{doc.description}</p>
      <div>{doc.content}</div>
    </article>
  );
}
