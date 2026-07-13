/**
 * components/checkbox-field/page.tsx
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const DynamicPage = dynamic(() => import('./CheckboxFieldPageContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function CheckboxFieldComponentPage() {
  return <DynamicPage />;
}
