/**
 * RunGroupFrame.tsx
 *
 * The labeled "Run #N" frame (D-07). A generation run's artifact card is placed
 * inside its run frame so the spatial lineage prompt → run → artifact is
 * explicit on the canvas.
 *
 * Extends tldraw's `FrameShapeUtil` (mirroring `OneUIFrameShapeUtil`'s
 * extend-pattern WITHOUT importing it — LAB-03). The override is intentionally
 * minimal: the Lab's run frame does NOT need the artboard SVG-export machinery
 * (`toSvg`) — that is artboard-export-specific (P4). It patches the frame body
 * fill to the `bg-subtle` surface token (UI-SPEC Color § Secondary) so the run
 * group reads as a grouped section without competing with the cards inside it.
 *
 * The frame's `name` prop carries the "Run #N" label; tldraw renders it with
 * its built-in frame heading. Label typography follows the UI-SPEC Label-XS
 * role via the Lab's preview CSS-layer overrides (frame headings are tldraw
 * chrome, styled in canvas space).
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

/** The Run #N frame uses the bg-subtle surface fill token (UI-SPEC § Secondary). */
const RUN_FRAME_FILL = 'var(--Surface-Fill-Subtle, var(--Surface-Subtle))';

type PatchableProps = {
  children?: ReactNode;
  className?: string;
  fill?: string;
  stroke?: string;
  rx?: string;
  ry?: string;
};

/**
 * Map a children array through `patchFrameBodyFill`, guaranteeing every element
 * child carries a key. tldraw renders the frame body + heading as static JSX
 * siblings (no explicit keys); once we re-`.map()` them React treats the result
 * as a dynamic list and warns ("unique key" — the RunGroupFrame console error).
 * `cloneElement` only preserves an EXISTING key, so we add an index fallback for
 * element children that have none. Primitive children (strings) need no key.
 */
function mapPatchedChildren(arr: ReactNode[], fill: string): ReactNode[] {
  return arr.map((c, i) => {
    const patched = patchFrameBodyFill(c, fill);
    if (isValidElement(patched) && patched.key == null) {
      return cloneElement(patched as React.ReactElement, { key: `rgf-${i}` });
    }
    return patched;
  });
}

/**
 * Walk the rendered frame tree and set `fill` on the `tl-frame__body` node.
 * Mirrors `OneUIFrameShapeUtil.patchFrameBodyFill` (not imported — LAB-03).
 */
function patchFrameBodyFill(node: ReactNode, fill: string): ReactNode {
  if (!isValidElement(node)) return node;
  const props = node.props as PatchableProps;
  // Preserve the source element's key — when this node sits inside a mapped
  // array (tldraw renders the frame body + heading as a keyed list), recreating
  // a Fragment via createElement without its original key trips React's
  // "unique key" warning (RunGroupFrame console error).
  const key = node.key ?? undefined;
  if (node.type === Fragment) {
    const ch = props.children;
    if (Array.isArray(ch)) {
      return createElement(Fragment, { key }, mapPatchedChildren(ch, fill));
    }
    return createElement(Fragment, { key }, patchFrameBodyFill(ch, fill));
  }
  const classStr = typeof props.className === 'string' ? props.className : '';
  if (classStr.includes('tl-frame__body')) {
    return cloneElement(node as React.ReactElement<PatchableProps>, {
      fill,
      stroke: 'transparent',
      rx: 'var(--Shape-4)',
      ry: 'var(--Shape-4)',
    });
  }
  const ch = props.children;
  if (!ch) return node;
  if (Array.isArray(ch)) {
    return cloneElement(node as React.ReactElement<PatchableProps>, {
      children: mapPatchedChildren(ch, fill),
    });
  }
  return cloneElement(node as React.ReactElement<PatchableProps>, {
    children: patchFrameBodyFill(ch, fill),
  });
}

export class RunGroupFrameShapeUtil extends FrameShapeUtil {
  /** Patch the frame body fill to the bg-subtle surface token. */
  // @ts-expect-error — base method typing does not allow this override shape; see JSDoc.
  override component(shape: unknown) {
    const el = super.component(shape as never);
    return patchFrameBodyFill(el, RUN_FRAME_FILL);
  }
}
