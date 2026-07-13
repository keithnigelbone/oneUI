/**
 * canvas/view/[id]/page.tsx
 *
 * Read-only view of a saved composition.
 * Shows the generated code and optionally the canvas in read-only mode.
 */

'use client';

import React, { use } from 'react';
import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const CompositionViewer = dynamic(() => import('./CompositionViewer'), {
  ssr: false,
  loading: () => <PageLoader />,
});

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompositionViewPage({ params }: PageProps) {
  const { id } = use(params);
  return <CompositionViewer compositionId={id} />;
}
