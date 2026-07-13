/**
 * VariantGroupFrame.tsx
 *
 * The labeled "Variant Group" frame (CANVAS-05 / D-14). Best-of-N sibling
 * artifact cards that share a `variantGroupId` are placed inside ONE variant
 * frame so the cluster reads as a single generation's variants on the canvas
 * (the spatial analog of `RunGroupFrame`'s prompt → run → artifact lineage).
 *
 * Extends tldraw's `FrameShapeUtil` directly — mirroring `RunGroupFrame.tsx`
 * EXACTLY (the Builder's frame-shape util extend-pattern is replicated WITHOUT
 * importing it — LAB-03 isolation). `patchFrameBodyFill` is copied verbatim from
 * `RunGroupFrame.tsx`; the only difference is the body-fill surface token
 * (`bg-moderate` so a variant cluster reads one emphasis step bolder than a run
 * group) and the "Variant Group" label carried on the frame's `name` prop.
 *
 * The frame's `name` prop carries the "Variant Group" label; tldraw renders it
 * with its built-in frame heading. Label typography follows the UI-SPEC
 * Label-XS role via the Lab's preview CSS-layer overrides (frame headings are
 * tldraw chrome, styled in canvas space).
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

/** The "Variant Group" prefix the canvas uses on the frame `name` prop. */
export const VARIANT_GROUP_FRAME_LABEL = 'Variant Group' as const;

/**
 * The variant frame uses the bg-moderate surface fill token (UI-SPEC §
 * Secondary) so a variant cluster reads one emphasis step bolder than the
 * bg-subtle run group, without competing with the cards inside it.
 */
const VARIANT_FRAME_FILL = 'var(--Surface-Fill-Moderate, var(--Surface-Moderate))';

type PatchableProps = { children?: ReactNode; className?: string; fill?: string };

/**
 * Walk the rendered frame tree and set `fill` on the `tl-frame__body` node.
 * Copied VERBATIM from `RunGroupFrame.patchFrameBodyFill` (not imported, and the
 * Builder's frame-shape util is never imported — LAB-03).
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

export class VariantGroupFrameShapeUtil extends FrameShapeUtil {
  /** Patch the frame body fill to the bg-moderate surface token (variant cluster). */
  // @ts-expect-error — base method typing does not allow this override shape; see JSDoc.
  override component(shape: unknown) {
    const el = super.component(shape as never);
    return patchFrameBodyFill(el, VARIANT_FRAME_FILL);
  }
}
