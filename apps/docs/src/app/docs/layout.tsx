import type { ReactNode } from 'react';
import { DocsShell, type DocsTree } from '@/components/DocsShell';
import { source } from '@/lib/source';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShell tree={source.getPageTree() as DocsTree}>{children}</DocsShell>;
}
