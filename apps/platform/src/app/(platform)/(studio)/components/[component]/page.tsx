/**
 * components/[component]/page.tsx
 *
 * Generic showcase route for registry components without a bespoke page.
 * Next.js static-segment precedence keeps the hand-built pages
 * (button/, avatar/, switch/, …) winning; every other manifest-bearing
 * slug renders through GenericComponentPageContent.
 */

'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicGenericPage = dynamic(() => import('../lib/GenericComponentPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function GenericComponentPage({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = use(params);
  return <DynamicGenericPage slug={component} />;
}
