'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const StartHereContent = dynamic(() => import('./StartHereContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function StartHerePage() {
  return <StartHereContent />;
}
