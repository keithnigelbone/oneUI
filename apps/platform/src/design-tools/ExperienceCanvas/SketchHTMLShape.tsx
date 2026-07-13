/**
 * SketchHTMLShape.tsx — Sketch Artboard
 *
 * tldraw custom shape that renders a full OneUI screen AST as real React
 * components inside a sandboxed, viewport-sized iframe. The iframe is a
 * visual container only — React lives in the parent app, so every
 * component is the actual `@oneui/ui` implementation with real icons,
 * real surface-context cascade, real focus halos, etc.
 *
 * How it works:
 *   1. The shape holds a serialised ASTRoot in its props (produced by
 *      `/api/canvas/generate`).
 *   2. On mount, an empty `<iframe srcDoc>` is created. We wait for its
 *      document to be ready.
 *   3. `useIframeStyleMirror` copies every parent `<style>` + matching
 *      `<link rel="stylesheet">` node into the iframe's `<head>` and
 *      observes the parent head for mutations so brand-CSS swaps, theme
 *      toggles, and density changes flow through live.
 *   4. `<html>` data attributes (`data-mode`, `data-density`,
 *      `data-Breakpoint`) are mirrored the same way.
 *   5. `ReactDOM.createPortal(<ASTRenderer tree={ast} mode="render" />,
 *      iframeDoc.body)` mounts the component tree into the iframe. React
 *      contexts (PlatformContext, foundation providers) propagate across
 *      the portal because portals preserve the parent React tree.
 *
 * Because the iframe is `sandbox="allow-same-origin allow-scripts"` and
 * hosted on the same origin, we have full DOM access for the mirror +
 * portal. No network round-trips, no serialisation boundary.
 */

'use client';

import {
  ShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  type Geometry2d,
  type RecordProps,
} from 'tldraw';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ASTRenderer } from '@oneui/ui-internal/runtime/ASTRenderer';
import type { ASTRoot } from '@oneui/shared';

// ---------------------------------------------------------------------------
// Shape type + viewports
// ---------------------------------------------------------------------------

export const SKETCH_HTML_SHAPE_TYPE = 'oneui-sketch-html' as const;

export const SKETCH_VIEWPORTS = {
  mobile:  { w: 390,  h: 844,  label: 'Mobile (390×844)',  platformId: 'S' },
  tablet:  { w: 768,  h: 1024, label: 'Tablet (768×1024)', platformId: 'M' },
  desktop: { w: 1280, h: 800,  label: 'Desktop (1280×800)', platformId: 'L' },
} as const;

export type SketchViewport = keyof typeof SKETCH_VIEWPORTS;

export type SketchHTMLShapeProps = {
  w: number;
  h: number;
  /** Full ASTRoot from /api/canvas/generate. Stored as tldraw JSON value. */
  ast: unknown;
  viewport: SketchViewport;
  prompt: string;
};

// ---------------------------------------------------------------------------
// Iframe document bootstrap
//
// The srcDoc is deliberately minimal — just <html> + <head> + <body>. All
// styling arrives via the style-mirror effect once the document is ready.
// ---------------------------------------------------------------------------

const INITIAL_SRCDOC = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; min-height: 100%; box-sizing: border-box; }
      *, *::before, *::after { box-sizing: border-box; }
    </style>
  </head>
  <body></body>
</html>`;

// ---------------------------------------------------------------------------
// useIframeStyleMirror
//
// Mirror every <style> element and every <link rel="stylesheet"> from
// `document.head` into the iframe's head. A MutationObserver keeps the
// mirror in sync as brand CSS is swapped, theme/density attributes change,
// and new stylesheets load.
//
// We clone once per node and attach a single shared MutationObserver to the
// parent head. Linked stylesheets (e.g. font files, external CSS modules)
// are mirrored by cloning their <link> tag — the iframe re-fetches from the
// same URL but the browser's HTTP cache makes this ~free.
// ---------------------------------------------------------------------------

function useIframeStyleMirror(iframeDoc: Document | null): void {
  useEffect(() => {
    if (!iframeDoc || typeof document === 'undefined') return;

    const parentHead = document.head;
    const iframeHead = iframeDoc.head;
    /** Map parent nodes → cloned iframe nodes so we can update in place. */
    const clones = new Map<Node, Node>();

    const shouldMirror = (node: Node): boolean => {
      if (!(node instanceof HTMLElement)) return false;
      if (node.tagName === 'STYLE') return true;
      if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') return true;
      return false;
    };

    const cloneInto = (node: Node): void => {
      if (!shouldMirror(node)) return;
      const clone = node.cloneNode(true) as HTMLElement;
      iframeHead.appendChild(clone);
      clones.set(node, clone);
    };

    const removeClone = (node: Node): void => {
      const clone = clones.get(node);
      if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
      clones.delete(node);
    };

    const syncClone = (node: Node): void => {
      const clone = clones.get(node);
      if (!clone) {
        cloneInto(node);
        return;
      }
      // For <style> tags, the cheapest path is to mirror textContent — the
      // parent app rewrites the style element in place when brand CSS swaps,
      // so this fires whenever useBrandCSS updates its <style id="oneui-foundation-tokens">.
      if (node instanceof HTMLStyleElement && clone instanceof HTMLStyleElement) {
        clone.textContent = node.textContent;
      }
    };

    // Initial mirror — copy every current stylesheet node.
    parentHead.childNodes.forEach(cloneInto);

    // Mirror <html> data attributes (data-mode / data-density / data-Breakpoint).
    const mirrorHtmlAttrs = () => {
      const src = document.documentElement;
      const dst = iframeDoc.documentElement;
      for (const attr of Array.from(src.attributes)) {
        if (attr.name.startsWith('data-')) {
          dst.setAttribute(attr.name, attr.value);
        }
      }
    };
    mirrorHtmlAttrs();

    // Watch the parent head for additions, removals, and text updates.
    const headObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          if (m.target instanceof HTMLStyleElement) {
            // useBrandCSS updates brand CSS via `element.textContent = newCSS`.
            // That replaces the child text node, firing a childList mutation on
            // the <style> element itself (not on parentHead). Sync the clone.
            syncClone(m.target);
          } else {
            m.addedNodes.forEach(cloneInto);
            m.removedNodes.forEach(removeClone);
          }
        }
        if (m.type === 'characterData' && m.target.parentNode) {
          // Handles direct `.data =` mutations on text nodes (less common path).
          syncClone(m.target.parentNode);
        }
      }
    });
    headObserver.observe(parentHead, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Watch the parent <html> for attribute changes (theme/density toggles).
    const htmlObserver = new MutationObserver(mirrorHtmlAttrs);
    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode', 'data-density', 'data-Breakpoint', 'data-6-Density'],
    });

    return () => {
      headObserver.disconnect();
      htmlObserver.disconnect();
      clones.forEach((clone) => clone.parentNode?.removeChild(clone));
      clones.clear();
    };
  }, [iframeDoc]);
}

// ---------------------------------------------------------------------------
// SketchArtboard — the React tree that lives inside the iframe via portal.
// ---------------------------------------------------------------------------

interface SketchArtboardProps {
  ast: ASTRoot;
  viewport: SketchViewport;
}

function SketchArtboard({ ast, viewport }: SketchArtboardProps) {
  const viewportSpec = SKETCH_VIEWPORTS[viewport];
  return (
    <div
      style={{
        minHeight: viewportSpec.h,
        width: viewportSpec.w,
        background: 'var(--Surface-Main)',
        color: 'var(--Text-High)',
        fontFamily: 'var(--Typography-Font-Primary)',
      }}
    >
      <ASTRenderer tree={ast} mode="render" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Iframe host component — manages the iframe, style mirror, and portal.
// ---------------------------------------------------------------------------

interface SketchIframeProps {
  ast: ASTRoot | null;
  viewport: SketchViewport;
}

function SketchIframe({ ast, viewport }: SketchIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null);

  // When the iframe mounts, grab its document once loaded.
  const handleLoad = useCallback(() => {
    const doc = iframeRef.current?.contentDocument ?? null;
    setIframeDoc(doc);
  }, []);

  // Some browsers fire `load` before React attaches the handler. Poll once on
  // mount as a belt-and-braces fallback.
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (doc && doc.readyState !== 'loading' && !iframeDoc) {
      setIframeDoc(doc);
    }
  }, [iframeDoc]);

  useIframeStyleMirror(iframeDoc);

  const portalContent = useMemo(() => {
    if (!iframeDoc || !ast) return null;
    return createPortal(<SketchArtboard ast={ast} viewport={viewport} />, iframeDoc.body);
  }, [iframeDoc, ast, viewport]);

  return (
    <>
      <iframe
        ref={iframeRef}
        title="Sketch artboard"
        sandbox="allow-same-origin allow-scripts"
        srcDoc={INITIAL_SRCDOC}
        onLoad={handleLoad}
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          background: 'transparent',
          display: 'block',
        }}
      />
      {portalContent}
    </>
  );
}

// ---------------------------------------------------------------------------
// ShapeUtil
// ---------------------------------------------------------------------------

export class SketchHTMLShapeUtil extends ShapeUtil<any> {
  static override type = SKETCH_HTML_SHAPE_TYPE;

  static override props: RecordProps<any> = {
    w: T.number,
    h: T.number,
    ast: T.jsonValue as any,
    viewport: T.string,
    prompt: T.string,
  };

  getDefaultProps() {
    return {
      w: SKETCH_VIEWPORTS.mobile.w,
      h: SKETCH_VIEWPORTS.mobile.h,
      ast: null,
      viewport: 'mobile' as SketchViewport,
      prompt: '',
    };
  }

  override canEdit() { return false; }
  override canResize() { return true; }
  override isAspectRatioLocked() { return false; }
  override canCull() { return false; }

  getGeometry(shape: any): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override onResize(shape: any, info: any) {
    return {
      ...shape,
      props: {
        ...shape.props,
        w: Math.max(240, info.initialShape.props.w * info.scaleX),
        h: Math.max(240, info.initialShape.props.h * info.scaleY),
      },
    };
  }

  component(shape: any) {
    const viewport: SketchViewport = shape.props.viewport ?? 'mobile';
    const ast: ASTRoot | null = (shape.props.ast as ASTRoot) ?? null;
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          pointerEvents: 'all',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--Surface-Fill-Subtle)',
            borderRadius: 'var(--Shape-4)',
            border: 'var(--Stroke-M) dashed var(--Primary-Tinted)',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <SketchIframe ast={ast} viewport={viewport} />
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape: any) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} ry={8} />;
  }
}
