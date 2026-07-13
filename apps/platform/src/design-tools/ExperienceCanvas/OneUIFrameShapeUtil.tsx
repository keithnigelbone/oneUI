/**
 * Frame shape with artboard fill driven by OneUI foundations (no separate ContainerShape layer).
 */

'use client';

import { cloneElement, createElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';
import { FrameShapeUtil } from 'tldraw';
import { useFrameThemeContext, type FrameThemeContextValue } from './FrameThemeContext';
import { useFrameArtboardSurfaceContext } from './FrameArtboardSurfaceContext';
import {
  getArtboardFrameExportContext,
  getArtboardFrameExportIncludeBackground,
  getFrameArtboardSurface,
} from './artboardFrameSurfaceStore';
import { resolveArtboardFrameFillCss, type ArtboardFrameFillContext } from './artboardSurfaces';

type PatchableProps = { children?: ReactNode; className?: string; fill?: string };

function patchFrameBodyFill(node: ReactNode, fill: string): ReactNode {
  if (!isValidElement(node)) return node;
  const props = node.props as PatchableProps;
  if (node.type === Fragment) {
    const ch = props.children;
    if (Array.isArray(ch)) {
      return createElement(
        Fragment,
        {},
        ch.map((c) => patchFrameBodyFill(c, fill)),
      );
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

function toFillContext(frameSubCtx: FrameThemeContextValue): ArtboardFrameFillContext {
  return {
    frameSubBrandByFrameId: frameSubCtx.frameSubBrandByFrameId,
    baseFoundationData: frameSubCtx.baseFoundationData,
    theme: frameSubCtx.mode,
    availableSubBrands: frameSubCtx.availableSubBrands,
  };
}

export class OneUIFrameShapeUtil extends FrameShapeUtil {
  /** Hooks + patch super SVG rect fill; base method typing does not allow this override shape. */
  // @ts-expect-error — see JSDoc above
  // fallow-ignore-next-line unused-class-member
  override component(shape: any) {
    const frameSubCtx = useFrameThemeContext();
    const surfaceCtx = useFrameArtboardSurfaceContext();
    const surface = surfaceCtx?.surfaces[shape.id];

    const fillCtx = frameSubCtx ? toFillContext(frameSubCtx) : null;
    const fill = surface ? resolveArtboardFrameFillCss(shape.id, surface, fillCtx) : null;

    const el = super.component(shape);
    if (!fill) return el;
    return patchFrameBodyFill(el, fill);
  }

  // fallow-ignore-next-line unused-class-member
  override toSvg(shape: any, _ctx: any) {
    // Render JUST the artboard body rect (no FrameHeading badge, no stroke).
    // tldraw's default FrameShapeUtil.toSvg() returns a Fragment of:
    //   <rect>     (the body)
    //   <g>        (the "FB Ad" label badge, positioned ABOVE the frame at y≈-60)
    //     <rect/>  (label background)
    //     <text/>  (label text)
    //   </g>
    // The label badge is only meaningful inside the tldraw editor — it has no
    // place in an exported artboard. Returning just the body rect (with the
    // brand-resolved surface fill) eliminates the phantom "Group → Vector +
    // Group → text 'FB Ad'" tree that was appearing at negative Y in Figma.
    //
    // When the user unchecks "Include background" in the export panel we
    // skip emitting the rect at all. Without this, the artboard's resolved
    // surface (e.g. `--Brand-Bg-Default` resolving to `#F9FAFB`) was always
    // baked into the SVG and showed up in Figma as a Frame fill — there
    // was no way to export an artboard with a transparent background.
    if (!getArtboardFrameExportIncludeBackground()) {
      return createElement(Fragment) as unknown as ReactElement<SVGElement>;
    }

    const surface = getFrameArtboardSurface(shape.id);
    const exp = getArtboardFrameExportContext() as ArtboardFrameFillContext | null;
    const fill = surface
      ? resolveArtboardFrameFillCss(shape.id, surface, exp)
      // INTENTIONAL-LITERAL: SVG fill attribute (not CSS); var() tokens not valid in SVG fill on export
      : '#ffffff';

    return createElement('rect', {
      width: shape.props.w,
      height: shape.props.h,
      x: 0,
      y: 0,
      fill,
    }) as unknown as ReactElement<SVGElement>;
  }
}
