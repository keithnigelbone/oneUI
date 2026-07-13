/**
 * PaddingInspector.tsx
 *
 * Hover-driven design inspector overlay (like Figma Inspect / Chrome DevTools).
 * Tracks mouse position and highlights the element under cursor with:
 * - Dashed outline around the hovered element
 * - Combined tag + dimensions label above
 * - Padding tint + tiny labels inside (root element only)
 * - Gap indicators between siblings
 * - Compact properties panel to the right
 *
 * Every element inside the component (button, icon slots, text label)
 * is individually selectable on hover.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './PaddingInspector.module.css';

export interface PaddingInspectorProps {
  /** Ref to the container (preview card) — used to calculate relative positions */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Whether the inspector is active */
  active: boolean;
}

/* ── Geometry helpers ─────────────────────────────────── */

interface Box { top: number; left: number; width: number; height: number }
interface Sides { top: number; right: number; bottom: number; left: number }
interface GapMark { x: number; y: number; w: number; h: number; value: number }

interface Inspection {
  box: Box;
  padding: Sides;
  gaps: GapMark[];
  isRoot: boolean;
  tag: string;
  props: Array<[string, string, string?]>; // [key, value, category?]
}

const r = (v: number) => Math.round(v);
const px = (s: string) => parseFloat(s) || 0;

/* ── Element classification ───────────────────────────── */

function tagOf(el: HTMLElement): string {
  const t = el.tagName.toLowerCase();
  if (t === 'button' || el.getAttribute('role') === 'button') return 'button';
  if (t === 'svg') return 'svg';
  if (t === 'span') {
    if (el.querySelector('svg')) return 'icon';
    if (!el.children.length && el.textContent?.trim()) return 'text';
    return 'span';
  }
  if (t === 'a') return 'link';
  return t;
}

/* ── Property extraction ──────────────────────────────── */

function propsOf(el: HTMLElement, isRoot: boolean): Array<[string, string, string?]> {
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const out: Array<[string, string, string?]> = [];

  out.push(['width', r(rect.width) + 'px', 'dim']);
  out.push(['height', r(rect.height) + 'px', 'dim']);

  if (isRoot) {
    const pt = px(cs.paddingTop), pr = px(cs.paddingRight);
    const pb = px(cs.paddingBottom), pl = px(cs.paddingLeft);
    if (pt || pr || pb || pl) {
      out.push(['padding', `${r(pt)} ${r(pr)} ${r(pb)} ${r(pl)}`, 'pad']);
    }
    if (cs.gap && cs.gap !== 'normal' && cs.gap !== '0px') {
      out.push(['gap', cs.gap, 'gap']);
    }
    out.push(['border-radius', r(px(cs.borderRadius)) + 'px', 'shape']);
    out.push(['background', cs.backgroundColor, 'color']);
    out.push(['color', cs.color, 'color']);
    out.push(['font-size', r(px(cs.fontSize)) + 'px', 'typo']);
    out.push(['font-weight', cs.fontWeight, 'typo']);
  } else {
    const tag = tagOf(el);
    if (tag === 'text' || tag === 'span') {
      out.push(['font-family', cs.fontFamily.split(',')[0].replace(/['"]/g, ''), 'typo']);
      out.push(['font-size', r(px(cs.fontSize)) + 'px', 'typo']);
      out.push(['font-weight', cs.fontWeight, 'typo']);
      out.push(['line-height', cs.lineHeight === 'normal' ? 'normal' : r(px(cs.lineHeight)) + 'px', 'typo']);
      out.push(['color', cs.color, 'color']);
    }
    if (tag === 'icon' || tag === 'svg') {
      out.push(['color', cs.color, 'color']);
    }
    // Show margins if present
    const ml = px(cs.marginLeft), mr = px(cs.marginRight);
    if (ml > 0) out.push(['margin-left', r(ml) + 'px', 'gap']);
    if (mr > 0) out.push(['margin-right', r(mr) + 'px', 'gap']);
  }

  return out;
}

/* ── Component ────────────────────────────────────────── */

export function PaddingInspector({ containerRef, active }: PaddingInspectorProps) {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const currentElRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef(0);

  /* Find the root interactive element (button / link) */
  const findRoot = useCallback((): HTMLElement | null => {
    if (!containerRef.current) return null;
    return containerRef.current.querySelector(
      'button, [role="button"], a[href]'
    ) as HTMLElement | null;
  }, [containerRef]);

  /* Measure a single element relative to the container */
  const measure = useCallback((el: HTMLElement, root: HTMLElement): Inspection | null => {
    const container = containerRef.current;
    if (!container) return null;

    const cRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const isRoot = el === root;

    const box: Box = {
      top: elRect.top - cRect.top,
      left: elRect.left - cRect.left,
      width: elRect.width,
      height: elRect.height,
    };

    const padding: Sides = {
      top: px(cs.paddingTop),
      right: px(cs.paddingRight),
      bottom: px(cs.paddingBottom),
      left: px(cs.paddingLeft),
    };

    /* Gaps between children / siblings */
    const gaps: GapMark[] = [];

    if (isRoot) {
      // Show gaps between all direct children
      const kids = Array.from(el.children) as HTMLElement[];
      for (let i = 0; i < kids.length - 1; i++) {
        const a = kids[i].getBoundingClientRect();
        const b = kids[i + 1].getBoundingClientRect();
        const gw = b.left - a.right;
        if (gw > 1) {
          gaps.push({
            x: a.right - cRect.left,
            y: elRect.top - cRect.top,
            w: gw,
            h: elRect.height,
            value: r(gw),
          });
        }
      }
    } else {
      // Show gap to adjacent siblings
      const parent = el.parentElement;
      if (parent && root.contains(parent)) {
        const sibs = Array.from(parent.children) as HTMLElement[];
        const idx = sibs.indexOf(el);
        if (idx > 0) {
          const prev = sibs[idx - 1].getBoundingClientRect();
          const gw = elRect.left - prev.right;
          if (gw > 1) {
            gaps.push({
              x: prev.right - cRect.left,
              y: Math.min(prev.top, elRect.top) - cRect.top,
              w: gw,
              h: Math.max(prev.height, elRect.height),
              value: r(gw),
            });
          }
        }
        if (idx < sibs.length - 1) {
          const next = sibs[idx + 1].getBoundingClientRect();
          const gw = next.left - elRect.right;
          if (gw > 1) {
            gaps.push({
              x: elRect.right - cRect.left,
              y: Math.min(next.top, elRect.top) - cRect.top,
              w: gw,
              h: Math.max(next.height, elRect.height),
              value: r(gw),
            });
          }
        }
      }
    }

    return {
      box,
      padding,
      gaps,
      isRoot,
      tag: tagOf(el),
      props: propsOf(el, isRoot),
    };
  }, [containerRef]);

  /* ── Mouse tracking + resize observation ─────────── */

  useEffect(() => {
    if (!active) { setInspection(null); return; }

    const container = containerRef.current;
    const root = findRoot();
    if (!container || !root) return;

    // Start with no inspection — only show on hover
    currentElRef.current = null;
    setInspection(null);

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        let target = e.target as HTMLElement;
        if (!target || !container.contains(target)) return;

        // Skip our own overlay elements
        if (target.closest('[data-inspector-overlay]')) return;

        // Walk up from tiny sub-elements (svg paths etc.) to something meaningful
        while (target !== root && target.parentElement && root.contains(target)) {
          const tr = target.getBoundingClientRect();
          if (tr.width >= 6 && tr.height >= 6) break;
          target = target.parentElement;
        }

        // If outside root, default to root
        if (!root.contains(target)) target = root;

        if (target !== currentElRef.current) {
          currentElRef.current = target;
          const m = measure(target, root);
          if (m) setInspection(m);
        }
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(rafRef.current);
      currentElRef.current = null;
      setInspection(null);
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);

    // Re-measure on resize (only if currently hovering an element)
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = currentElRef.current;
        if (!el) return;
        const m = measure(el, root);
        if (m) setInspection(m);
      });
    });
    ro.observe(root);
    ro.observe(container);

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, containerRef, findRoot, measure]);

  /* ── Render ──────────────────────────────────────── */

  if (!active || !inspection) return null;

  const { box: b, padding: p, gaps, isRoot, tag, props } = inspection;
  const hasPad = p.top > 0 || p.right > 0 || p.bottom > 0 || p.left > 0;

  return (
    <div className={styles.overlay} data-inspector-overlay>
      {/* ── Dashed outline ── */}
      <div
        className={styles.outline}
        style={{ top: b.top, left: b.left, width: b.width, height: b.height }}
      />

      {/* ── Combined tag + dimensions label (outside, above) ── */}
      <span className={styles.tagLabel} style={{
        top: b.top - 22,
        left: b.left,
      }}>
        {tag} <span className={styles.tagDim}>{r(b.width)}×{r(b.height)}</span>
      </span>

      {/* ── Padding tint + tiny labels (root only) ── */}
      {isRoot && hasPad && (
        <>
          {p.top > 2 && (
            <>
              <div className={styles.padEdge} style={{
                top: b.top, left: b.left, width: b.width, height: p.top,
              }} />
              <span className={styles.padLabel} style={{
                top: b.top + p.top / 2,
                left: b.left + b.width / 2,
                transform: 'translate(-50%, -50%)',
              }}>{r(p.top)}</span>
            </>
          )}
          {p.bottom > 2 && (
            <>
              <div className={styles.padEdge} style={{
                top: b.top + b.height - p.bottom, left: b.left, width: b.width, height: p.bottom,
              }} />
              <span className={styles.padLabel} style={{
                top: b.top + b.height - p.bottom / 2,
                left: b.left + b.width / 2,
                transform: 'translate(-50%, -50%)',
              }}>{r(p.bottom)}</span>
            </>
          )}
          {p.left > 2 && (
            <>
              <div className={styles.padEdge} style={{
                top: b.top + p.top, left: b.left, width: p.left, height: b.height - p.top - p.bottom,
              }} />
              <span className={styles.padLabel} style={{
                top: b.top + b.height / 2,
                left: b.left + p.left / 2,
                transform: 'translate(-50%, -50%)',
              }}>{r(p.left)}</span>
            </>
          )}
          {p.right > 2 && (
            <>
              <div className={styles.padEdge} style={{
                top: b.top + p.top, left: b.left + b.width - p.right, width: p.right, height: b.height - p.top - p.bottom,
              }} />
              <span className={styles.padLabel} style={{
                top: b.top + b.height / 2,
                left: b.left + b.width - p.right / 2,
                transform: 'translate(-50%, -50%)',
              }}>{r(p.right)}</span>
            </>
          )}
        </>
      )}

      {/* ── Gap indicators ── */}
      {gaps.map((g, i) => (
        <React.Fragment key={i}>
          <div className={styles.gapEdge} style={{
            top: g.y, left: g.x, width: g.w, height: g.h,
          }} />
          <span className={styles.gapLabel} style={{
            top: g.y + g.h / 2,
            left: g.x + g.w / 2,
            transform: 'translate(-50%, -50%)',
          }}>{g.value}</span>
        </React.Fragment>
      ))}

      {/* ── Properties panel (always visible for hovered element) ── */}
      <div className={styles.panel} style={{
        top: b.top,
        left: b.left + b.width + 10,
      }}>
        {props.map(([key, value, cat], i) => (
          <div key={i} className={styles.panelRow}>
            <span className={styles.panelKey}>{key}</span>
            <span className={styles.panelVal} data-cat={cat}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaddingInspector;
