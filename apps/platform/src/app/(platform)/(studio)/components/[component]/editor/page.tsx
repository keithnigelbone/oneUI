/**
 * [component]/editor/page.tsx
 *
 * Thin shell — compiles instantly and shows a skeleton while
 * the heavy EditorContent module is compiled in the background.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

interface PageProps {
  params: Promise<{ component: string }>;
}

const EditorContent = dynamic(() => import('./EditorContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function AdvancedEditorPage({ params }: PageProps) {
  return <EditorContent params={params} />;
}
