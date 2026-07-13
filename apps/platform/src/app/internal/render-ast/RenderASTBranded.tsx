/**
 * RenderASTBranded.tsx
 *
 * Client wrapper that renders a server-derived AST INSIDE the artifact brand's
 * live foundation cascade — the fix for "preview looks broken".
 *
 * `/internal/render-ast` lives outside the `(platform)` route group, so it never
 * mounts `FoundationStyleBridge` and has no Convex/Platform context. On its own
 * the page only has the static base tokens (spacing/shape/type) plus whatever
 * brand CSS the main app happened to cache in localStorage — i.e. the WRONG
 * brand. Surface/colour/text tokens for the artifact's real brand are missing,
 * so surfaces collapse (black boxes), pill buttons render as bare circles, and
 * text is invisible.
 *
 * Here we re-create the minimal context the cascade needs:
 *   ConvexClientProvider  → Convex queries (getBrandOverviewData)
 *   FoundationStyleProvider (injectionMode 'global', keyed to the artifact's
 *                            brandId) → injects that brand's surfaces/colours/
 *                            typography/dimension/font/component-override CSS via
 *                            the SAME useBrandCSS pipeline the main app uses.
 *
 * The AST is consumed server-side (page.tsx) and passed in as a plain
 * JSON-serializable prop — no token/credential reaches the client.
 */

'use client';

import { useEffect, useState } from 'react';
import { ASTRenderer } from '@oneui/ui/runtime';
import { IconProvider } from '@oneui/ui/icons/IconContext';
import type { ASTRoot } from '@oneui/shared';
import {
  normalizeRenderDensity,
  normalizeRenderPlatform,
  renderPlatformForViewportWidth,
  type RenderPlatform,
} from '@oneui/experience-builder-core';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { ConvexClientProvider } from '@/providers/ConvexClientProvider';
import { FoundationStyleProvider } from '@/components/FoundationStyleProvider';
import { JioIconsInit } from '@/components/JioIconsInit';
import {
  IR_NODE_RECTS_MESSAGE_TYPE,
  type IrNodeRect,
} from '@/app/(platform)/(experience-lab)/_canvas/agentCursors';

/**
 * (AGENT-04 / D-06c) The rect-only iframe→canvas reporter. Runs INSIDE the
 * sandboxed preview iframe: it reads the bounding box of every element stamped
 * with `data-ir-node-id` (stamped at render time by `ASTRenderer`) and posts the list to the embedding canvas
 * via `postMessage`. The canvas draws the per-agent cursor overlay OUTSIDE the
 * iframe from these rects — no CSP relaxation, no per-node DOM handle reaches
 * across the origin boundary.
 *
 * SECURITY (T-04.2-14): the message payload carries ONLY node id STRINGS and
 * numeric bounding-rect coordinates — never tokens, cookies, storage, or any
 * sensitive value. The reporter never reads `document.cookie`, `localStorage`,
 * or any auth surface. It is strictly additive: a passive read of layout boxes.
 *
 * Re-reports on resize (window + ResizeObserver on the render target) and scroll
 * so the overlay stays aligned as the preview reflows. `pos.left/top` are
 * relative to the iframe's own viewport, which is exactly the iframe's content
 * box on the canvas side — the canvas adds the iframe's screen offset.
 */
function IrNodeRectReporter() {
  useEffect(() => {
    // Only report when actually embedded (we have a parent window to post to).
    if (typeof window === 'undefined' || window.parent === window) return;

    const collectAndPost = () => {
      const nodes = document.querySelectorAll<HTMLElement>('[data-ir-node-id]');
      const rects: IrNodeRect[] = [];
      nodes.forEach((el) => {
        const id = el.getAttribute('data-ir-node-id');
        if (!id) return;
        const box = el.getBoundingClientRect();
        // Numbers + id string ONLY. Round to keep the payload tiny.
        rects.push({
          id,
          left: Math.round(box.left),
          top: Math.round(box.top),
          width: Math.round(box.width),
          height: Math.round(box.height),
        });
      });
      // `targetOrigin: '*'` is safe here: the payload contains no secrets, and
      // the canvas validates the message type/shape before drawing.
      window.parent.postMessage({ type: IR_NODE_RECTS_MESSAGE_TYPE, rects }, '*');
    };

    // Debounce bursts of layout events into a single rAF-batched report.
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        collectAndPost();
      });
    };

    // Initial report once layout settles (fonts/brand CSS land async).
    schedule();
    const settle = window.setTimeout(schedule, 300);

    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);

    const target = document.querySelector('[data-render-target]');
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (observer && target) observer.observe(target);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      observer?.disconnect();
    };
  }, []);

  return null;
}

function useResponsiveRenderPlatform(fallbackPlatform: RenderPlatform): RenderPlatform {
  const [viewportPlatform, setViewportPlatform] = useState<RenderPlatform>(fallbackPlatform);

  useEffect(() => {
    const update = () => {
      setViewportPlatform(renderPlatformForViewportWidth(window.innerWidth));
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return viewportPlatform;
}

export function RenderASTBranded({
  ast,
  brandId,
  surfaceMode,
  theme = 'light',
  platform,
  density,
}: {
  ast: ASTRoot;
  /** The artifact's brand — drives the injected foundation cascade. */
  brandId?: string;
  surfaceMode?: string;
  theme?: string;
  platform?: string;
  density?: string;
}) {
  const resolvedTheme: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const resolvedDensity = normalizeRenderDensity(density);
  const fallbackPlatform = normalizeRenderPlatform(platform);
  const resolvedPlatform = useResponsiveRenderPlatform(fallbackPlatform);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-density', resolvedDensity);
    document.documentElement.setAttribute('data-6-Density', resolvedDensity);
    document.documentElement.setAttribute('data-Breakpoint', resolvedPlatform);
  }, [resolvedDensity, resolvedPlatform, resolvedTheme]);

  const content = (
    <IconProvider iconSet="jio" defaultSize="md">
      <JioIconsInit />
      <div
        data-render-target
        data-oneui-canvas="true"
        data-surface="default"
        data-surface-step="2500"
        data-appearance="primary"
        data-theme={resolvedTheme}
        data-density={resolvedDensity}
        style={{
          minHeight: '100dvh',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'clip',
          background: 'var(--Surface-Fill-Default, var(--Surface-Main))',
          color: 'var(--Text-High)',
          fontFamily: 'var(--Typography-Font-Primary)',
        }}
      >
        <ASTRenderer
          tree={ast}
          mode="render"
          surfaceMode={surfaceMode ?? (ast.surfaceMode as string | undefined) ?? 'default'}
          platform={resolvedPlatform}
          density={resolvedDensity}
        />
        {/* AGENT-04 / D-06c: rect-only reporter — posts IR node bounding boxes to
            the embedding canvas (no secrets cross the origin boundary). */}
        <IrNodeRectReporter />
      </div>
    </IconProvider>
  );

  // No brand id (legacy/eval callers): render with the ambient cascade only.
  if (!brandId) return content;

  const id = brandId as Id<'brands'>;
  return (
    <ConvexClientProvider>
      <FoundationStyleProvider
        brandId={id}
        injectionBrandId={id}
        theme={resolvedTheme}
        injectionMode="global"
        platformBrandId={id}
        currentSubBrand={null}
      >
        {content}
      </FoundationStyleProvider>
    </ConvexClientProvider>
  );
}
