/**
 * PageLoader.tsx
 *
 * Inline spinner shown during page transitions. Centered in the Shell
 * content area — i.e. the viewport minus the TopBar height, so the
 * spinner sits at the optical center of the website, not the raw viewport.
 * Delegates to the design system <Spinner> component.
 */

import { Spinner } from '@oneui/ui/components/Spinner';

export function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        minHeight: 'calc(100vh - var(--Component-Height-TopBar) - var(--Stroke-M))',
      }}
    >
      <Spinner size="2XL" label="Loading" />
    </div>
  );
}
