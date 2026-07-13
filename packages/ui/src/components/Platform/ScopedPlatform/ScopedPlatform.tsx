/**
 * ScopedPlatform.tsx
 *
 * Scoped preview wrapper that applies a specific (platform, breakpoint, density)
 * context to a subtree WITHOUT mutating `<html>` attributes. Mirrors the
 * architectural pattern of <Surface> — pure attribute writes, no runtime
 * recomputation, no JavaScript beyond passing props through.
 *
 * Why scoped instead of global: flipping the active platform on `<html>` would
 * rescale the entire studio chrome (sidebar, header, nav) whenever a designer
 * previews Print A4 or TV Native. That's disorienting and unnecessary —
 * chrome should always render at the tool's own platformBrandId/Web resolution,
 * and only the showcase/preview area should reflect the selected platform.
 *
 * How it works: the CSS cascade selectors in `scale.css` and the generated
 * `@layer brand` dimension overrides target `[data-Breakpoint][data-6-Density]`
 * — those selectors work on ANY element, not just `<html>`. Writing the
 * attributes onto a wrapper div therefore creates a scoped dimension cascade
 * that propagates to every descendant via CSS inheritance (f-step variables)
 * without touching global state.
 *
 * @example
 * ```tsx
 * <ScopedPlatform platformId="print" breakpointId="print-a4-portrait" density="default">
 *   <Button>I'm rendered with A4 print dimensions</Button>
 * </ScopedPlatform>
 * ```
 */

'use client';

import * as React from 'react';
import { useLayoutEffect, useRef } from 'react';
import type { PlatformCategory } from '@oneui/shared';

export interface ScopedPlatformProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Top-level platform id (`web`, `mobile-native`, `print`, `outdoor`, etc.).
   * Informational — only used to set `data-platform-category` when a category
   * is not passed explicitly. The actual cascade is driven by `breakpointId`.
   */
  platformId?: string;
  /**
   * Breakpoint id within the platform. This value lands on `data-Breakpoint`
   * and drives all `[data-Breakpoint="..."][data-6-Density="..."]` CSS
   * selectors emitted by `scale.css` and the brand CSS dimension pipeline.
   *
   * For Web, use one of the S/M/L breakpoint IDs (`S`, `M`, `L`) so the static
   * tables match. For non-web platforms, use the breakpoint id configured in the
   * Platforms foundation editor (e.g., `print-a4-portrait`).
   */
  breakpointId: string;
  /** Density mode. Defaults to `default`. */
  density?: 'default' | 'compact' | 'open';
  /**
   * Optional category hint. Rendered onto `data-platform-category` so future
   * CSS can branch per category (e.g., print-only overrides). Purely additive;
   * no current selector depends on this attribute.
   */
  category?: PlatformCategory;
  /** Polymorphic element type — defaults to `div` */
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function ScopedPlatform({
  platformId,
  breakpointId,
  density = 'default',
  category,
  as: Component = 'div',
  className,
  style,
  children,
  ...rest
}: ScopedPlatformProps) {
  // React lowercases `data-*` JSX attributes at render time (e.g.
  // `data-Breakpoint` → `data-breakpoint`). The dimension cascade's CSS
  // selectors in `scale.css` and the generated `@layer brand` blocks use
  // the PascalCase literal name (`[data-Breakpoint="S"]`), which does
  // NOT match lowercased attribute names in HTML documents. Setting the
  // attribute imperatively via `setAttribute()` on a ref preserves the
  // exact casing the CSS expects.
  //
  // Same pattern as `ContentBlock.tsx` / `ComponentHarness.tsx` — see the
  // comments there for the original gotcha writeup.
  const rootRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Canonical S/M/L breakpoint attribute (drives scale.css [data-Breakpoint]
    // overrides + brand dimension overrides). Non-web breakpoint ids (print, etc.)
    // don't map to S/M/L and resolve via the dynamic DIN path instead.
    const webBp: Record<string, 'S' | 'M' | 'L'> = { S: 'S', M: 'M', L: 'L' };
    const bp = webBp[breakpointId];
    if (bp) el.setAttribute('data-Breakpoint', bp);
    else el.removeAttribute('data-Breakpoint');
    el.setAttribute('data-6-Density', density);
    if (category) el.setAttribute('data-platform-category', category);
    else el.removeAttribute('data-platform-category');
    if (platformId) el.setAttribute('data-platform-id', platformId);
    else el.removeAttribute('data-platform-id');
  });

  return (
    <Component
      {...rest}
      ref={rootRef}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
}
