'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const CanvasWorkspace = dynamic(() => import('./CanvasWorkspace'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function CreateCanvasPage() {
  return <CanvasWorkspace />;
}
