/**
 * canvas/page.tsx
 *
 * Full-bleed tldraw canvas for composing OneUI components.
 * No secondary navigation — the canvas takes all available space.
 * Dynamic import (ssr: false) since tldraw requires browser APIs.
 */

'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const CanvasContent = dynamic(() => import('./CanvasContent'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function CanvasPage() {
  return <CanvasContent />;
}
