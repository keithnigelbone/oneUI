/**
 * components/layout.tsx
 *
 * Brand scope wrapper for all component showcase pages.
 *
 * Injects for the editing brand:
 * 1. Root CSS custom properties as inline styles (--Primary-Bold, etc.)
 *    → allows descendant components to read the editing brand's tokens
 * 2. Surface context CSS via <style> ([data-surface="bold"] { ... })
 *    → allows <Surface> components to remap tokens for each surface mode
 *
 * Component-theme CSS (--Button-borderRadius, --Button-paddingHorizontal, …)
 * is NOT injected here. It is emitted globally at :root by
 * FoundationStyleProvider (#oneui-component-overrides) for the same editing
 * brand (themeScope is pinned to 'global'). Injecting a second, scoped copy
 * here caused the docs previews to drift from the platform chrome, so the
 * single global source is used instead.
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { useSurfaceTokenVarsNew as useSurfaceTokenVars } from '@oneui/ui/hooks/useSurfaceTokenVarsNew';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { BrandEditGate } from '@/components/access/BrandEditGate';

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  const foundationData = useFoundationData();
  const { theme } = usePlatformContext();
  const pathname = usePathname();
  const isEditorRoute = pathname.includes('/editor');
  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const { surfaceVars, contextCSS } = useSurfaceTokenVars({
    foundationData,
    theme: themeKey,
    includeContextCSS: true,
  });

  // Component EDITOR routes mutate brand data (recipe selections, token
  // overrides) → gate for viewers. Showcase pages stay interactive: browsing
  // component demos is exactly what view-only access is for.
  const gatedChildren = isEditorRoute ? (
    <BrandEditGate>{children}</BrandEditGate>
  ) : (
    children
  );

  return (
    <div data-component-brand-scope style={{ ...surfaceVars }}>
      {contextCSS && (
        <style dangerouslySetInnerHTML={{ __html: contextCSS }} />
      )}
      {gatedChildren}
    </div>
  );
}
