import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsArticle, type DocsTocItem } from '@/components/DocsShell';
import { getMDXComponents } from '@/mdx-components';
import { source } from '@/lib/source';

interface DocsPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug ?? []);

  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const page = source.getPage(slug ?? []);

  if (!page) notFound();

  const MDX = page.data.body;
  const toc = getPageToc(slug ?? []);

  return (
    <DocsArticle title={page.data.title} description={page.data.description} toc={toc}>
      <MDX components={getMDXComponents()} />
    </DocsArticle>
  );
}

function getPageToc(slug: string[]): DocsTocItem[] | undefined {
  if (slug[0] === 'components' && slug[1]) {
    return [
      { title: 'Preview', url: '#preview' },
      { title: 'Installation', url: '#installation' },
      { title: 'Usage', url: '#usage' },
      { title: 'Intent', url: '#intent' },
      { title: 'Composition', url: '#composition' },
      { title: 'Variants', url: '#variants' },
      { title: 'API Reference', url: '#api-reference' },
    ];
  }

  return undefined;
}
