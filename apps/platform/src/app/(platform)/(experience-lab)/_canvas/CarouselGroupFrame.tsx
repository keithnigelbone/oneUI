/**
 * CarouselGroupFrame.tsx — CAMP-04 / D-07 ordered carousel group on the canvas.
 *
 * The labeled "Carousel: {direction name}" frame: ordered carousel frames sharing
 * one `variantGroupId` are placed inside ONE tldraw frame and render LEFT-TO-RIGHT
 * by `orderIndex` (Frame 1→2→3), each labeled "Frame {n} of {N}" with a per-frame
 * status pill. Order is MEANINGFUL (D-07) — unlike the interchangeable variant
 * group, the sequence is the carousel narrative (hook → … → CTA).
 *
 * Extends tldraw's `FrameShapeUtil` directly — mirroring `VariantGroupFrame.tsx`
 * / `RunGroupFrame.tsx` EXACTLY (the Builder's frame-shape util extend-pattern is
 * replicated WITHOUT importing it — LAB-03 isolation). `patchFrameBodyFill` is
 * copied from the sibling frames; the body-fill surface token is `bg-subtle`
 * (the carousel group reads as a grouped section without competing with the
 * frames inside it).
 *
 * The frame geometry (left-to-right ordering layout) is tldraw canvas-coordinate
 * math (exempt from the token rule, like the Phase-3 variant frame). All HTML
 * chrome inside the shape (group label, per-frame label, status pill) is Jio
 * components/tokens ONLY — token typography (`--Label-XS-*` +
 * `--Typography-Font-Primary`), the Jio `Badge` for status, and a `<Surface>`
 * container for any tinted fill (never a raw `<div style={{ background }}>`).
 * Status is conveyed by TEXT + role, never colour alone (WCAG AA).
 *
 * The pure ORDERING/LABEL/STATUS logic lives in `carouselFrameLayout.ts`
 * (framework-free, unit-tested); this file consumes it.
 */

'use client';

import {
  cloneElement,
  createElement,
  Fragment,
  isValidElement,
  type ReactNode,
} from 'react';
import { FrameShapeUtil } from 'tldraw';
import { Surface } from '@oneui/ui-internal/components/Surface/Surface';
import { Badge } from '@oneui/ui-internal/components/Badge/Badge';
import {
  orderCarouselFrames,
  frameLabel,
  carouselGroupLabel,
  frameStatusPill,
  repairExhaustedBody,
  type CarouselFrameOutcome,
  type OrderableFrame,
} from './carouselFrameLayout';

/** The "Carousel:" prefix the canvas uses on the frame `name` prop (D-07). */
export const CAROUSEL_GROUP_FRAME_LABEL_PREFIX = 'Carousel' as const;

/** The carousel frame uses the bg-subtle surface fill token (grouped section). */
const CAROUSEL_FRAME_FILL = 'var(--Surface-Fill-Subtle, var(--Surface-Subtle))';

type PatchableProps = { children?: ReactNode; className?: string; fill?: string };

/**
 * Walk the rendered frame tree and set `fill` on the `tl-frame__body` node.
 * Copied from `VariantGroupFrame.patchFrameBodyFill` (not imported; the Builder's
 * frame-shape util is never imported — LAB-03).
 */
function patchFrameBodyFill(node: ReactNode, fill: string): ReactNode {
  if (!isValidElement(node)) return node;
  const props = node.props as PatchableProps;
  if (node.type === Fragment) {
    const ch = props.children;
    if (Array.isArray(ch)) {
      return createElement(Fragment, {}, ch.map((c) => patchFrameBodyFill(c, fill)));
    }
    return createElement(Fragment, {}, patchFrameBodyFill(ch, fill));
  }
  const classStr = typeof props.className === 'string' ? props.className : '';
  if (classStr.includes('tl-frame__body')) {
    return cloneElement(node as React.ReactElement<PatchableProps>, { fill });
  }
  const ch = props.children;
  if (!ch) return node;
  if (Array.isArray(ch)) {
    return cloneElement(node as React.ReactElement<PatchableProps>, {
      children: ch.map((c) => patchFrameBodyFill(c, fill)),
    });
  }
  return cloneElement(node as React.ReactElement<PatchableProps>, {
    children: patchFrameBodyFill(ch, fill),
  });
}

export class CarouselGroupFrameShapeUtil extends FrameShapeUtil {
  /** Patch the frame body fill to the bg-subtle surface token (carousel group). */
  // @ts-expect-error — base method typing does not allow this override shape; see JSDoc.
  override component(shape: unknown) {
    const el = super.component(shape as never);
    return patchFrameBodyFill(el, CAROUSEL_FRAME_FILL);
  }
}

// ---------------------------------------------------------------------------
// Per-frame HTML chrome (token-only Jio components) — rendered inside the
// shape's HTMLContainer by the canvas. Geometry is canvas-coordinate math; this
// is the label + status pill chrome only.
// ---------------------------------------------------------------------------

/** Token-only micro-label styling (UI-SPEC Label-XS role + brand font). */
const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  fontFamily: 'var(--Typography-Font-Primary)',
  color: 'var(--Text-High)',
  margin: 0,
};

/** A carousel frame the chrome renders (the canvas-side frame summary). */
export interface CarouselGroupFrameData extends OrderableFrame {
  variantGroupId: string;
  outcome: CarouselFrameOutcome;
  copy?: { headline?: string; body?: string };
}

export interface CarouselGroupChromeProps {
  /** The chosen direction name (drives the group heading). */
  directionName: string;
  /** The carousel frames (any input order — sorted here by orderIndex). */
  frames: readonly CarouselGroupFrameData[];
}

/**
 * The carousel group chrome: the group heading + each ordered frame's label and
 * status pill, rendered left-to-right by `orderIndex`. Token-only Jio chrome
 * inside a `<Surface mode="subtle">` (never a raw background div). Consumes the
 * pure `carouselFrameLayout` helpers for ordering/labels/status.
 */
export function CarouselGroupChrome({ directionName, frames }: CarouselGroupChromeProps) {
  const ordered = orderCarouselFrames(frames);
  const total = ordered.length;

  return (
    <Surface mode="subtle">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--Spacing-3)',
          padding: 'var(--Spacing-4)',
        }}
      >
        <p
          style={{
            ...labelStyle,
            fontSize: 'var(--Label-S-FontSize)',
            lineHeight: 'var(--Label-S-LineHeight)',
            fontWeight: 'var(--Label-FontWeight-Medium)',
          }}
        >
          {carouselGroupLabel(directionName)}
        </p>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--Spacing-3)' }}>
          {ordered.map((frame) => {
            const pill = frameStatusPill(frame.outcome);
            const isExhausted = frame.outcome === 'repair-exhausted';
            return (
              <div
                key={`${frame.variantGroupId}-${frame.orderIndex}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-2)',
                }}
              >
                <p style={labelStyle}>{frameLabel(frame.orderIndex, total)}</p>
                <Badge appearance={pill.appearance} size="m">
                  {pill.text}
                </Badge>
                {isExhausted ? (
                  <p style={{ ...labelStyle, color: 'var(--Text-Medium)' }}>
                    {repairExhaustedBody(frame.orderIndex)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </Surface>
  );
}
