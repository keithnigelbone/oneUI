/**
 * Internal Button ornament renderer.
 *
 * Kept outside Button.tsx so undecorated buttons avoid SVG parsing and
 * decoration DOM work. This component is only rendered when decoration exists.
 */

'use client';

import React, { useMemo } from 'react';
import type { DecorationConfig } from '@oneui/shared';
import { extractSvgContent, getClosedFillPath, getOpenStrokePath } from '@oneui/shared';

export interface ButtonDecorationProps {
  decoration: DecorationConfig;
  isGhost: boolean;
  children: React.ReactNode;
}

interface OrnamentData {
  viewBox: string | null;
  /** Closed silhouette for CSS fill masks (must include Z). */
  closedFillPath: string | null;
  /** Open outer curve for ghost cap stroke outlines. */
  openStrokePath: string | null;
  showLeft: boolean;
  showRight: boolean;
  leftMirrorTransform?: string;
}

const CENTER_MASK_POSITION =
  'calc(var(--Button-ornament-width-left, 0px) - 1px) center';
const CENTER_MASK_SIZE =
  'calc(100% - var(--Button-ornament-width-left, 0px) - var(--Button-ornament-width-right, 0px) + 2px) 100%';

function svgMaskDataUrl(viewBox: string, pathD: string, mirrorTransform?: string): string {
  const inner = mirrorTransform
    ? `<g transform="${mirrorTransform}"><path d="${pathD}" fill="black"/></g>`
    : `<path d="${pathD}" fill="black"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="none">${inner}</svg>`;
  return `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}')`;
}

export function ButtonDecoration({ decoration, isGhost, children }: ButtonDecorationProps) {
  const ornamentData = useMemo<OrnamentData>(() => {
    const { svgContent, mirror, placement } = decoration;
    const showRight = placement === 'edges' || placement === 'right';
    const showLeft = placement === 'edges' || placement === 'left';
    const baseSvg = extractSvgContent(svgContent);
    const leftMirrorTransform = showLeft && mirror && baseSvg
      ? `translate(${baseSvg.viewBox.split(' ')[2]},0) scale(-1,1)`
      : undefined;

    return {
      viewBox: baseSvg?.viewBox ?? null,
      closedFillPath: getClosedFillPath(svgContent),
      openStrokePath: getOpenStrokePath(svgContent),
      showLeft,
      showRight,
      leftMirrorTransform,
    };
  }, [decoration]);

  const fillMaskStyle = useMemo(() => {
    if (isGhost || !ornamentData.closedFillPath) return undefined;

    const masks: string[] = [];
    const positions: string[] = [];
    const sizes: string[] = [];

    if (ornamentData.showLeft && ornamentData.viewBox) {
      masks.push(
        svgMaskDataUrl(
          ornamentData.viewBox,
          ornamentData.closedFillPath,
          ornamentData.leftMirrorTransform,
        ),
      );
      positions.push('left center');
      sizes.push('var(--Button-ornament-width-left) 100%');
    }

    masks.push('linear-gradient(black, black)');
    positions.push(CENTER_MASK_POSITION);
    sizes.push(CENTER_MASK_SIZE);

    if (ornamentData.showRight && ornamentData.viewBox) {
      masks.push(svgMaskDataUrl(ornamentData.viewBox, ornamentData.closedFillPath));
      positions.push('right center');
      sizes.push('var(--Button-ornament-width-right) 100%');
    }

    return {
      maskImage: masks.join(', '),
      WebkitMaskImage: masks.join(', '),
      maskPosition: positions.join(', '),
      WebkitMaskPosition: positions.join(', '),
      maskSize: sizes.join(', '),
      WebkitMaskSize: sizes.join(', '),
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskComposite: masks.map(() => 'add').join(', '),
      WebkitMaskComposite: masks.map(() => 'source-over').join(', '),
    } as React.CSSProperties;
  }, [ornamentData, isGhost]);

  return (
    <>
      {!isGhost && fillMaskStyle && (
        <span
          data-gradient-layer=""
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 'calc(-1 * var(--Button-ornament-width-left, 0px))',
            right: 'calc(-1 * var(--Button-ornament-width-right, 0px))',
            background: 'var(--_btn-bg)',
            pointerEvents: 'none',
            zIndex: 0,
            borderRadius: 'inherit',
            ...fillMaskStyle,
          }}
          aria-hidden="true"
        />
      )}
      {ornamentData.showLeft &&
        renderOrnament(
          'left',
          ornamentData.viewBox,
          ornamentData.closedFillPath,
          ornamentData.openStrokePath,
          isGhost,
          ornamentData.leftMirrorTransform,
        )}
      {children}
      {ornamentData.showRight &&
        renderOrnament(
          'right',
          ornamentData.viewBox,
          ornamentData.closedFillPath,
          ornamentData.openStrokePath,
          isGhost,
        )}
    </>
  );
}

function renderOrnament(
  side: 'left' | 'right',
  viewBox: string | null,
  fillPath: string | null,
  strokePath: string | null,
  isGhost: boolean,
  mirrorTransform?: string,
) {
  if (!viewBox || !fillPath) return null;

  const vbParts = viewBox.split(' ').map(Number);
  const vbWidth = vbParts[2] || 1;
  const vbHeight = vbParts[3] || 1;
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    height: 'calc((100% + var(--_btn-bw, 0px) * 2) * var(--Button-ornamentHeightScale, 1))',
    transform: 'translateY(-50%)',
    pointerEvents: 'auto',
    cursor: 'pointer',
    zIndex: 0,
    ...(side === 'left'
      ? { right: 'calc(100% - var(--Stroke-S, 0.5px))' }
      : { left: 'calc(100% - var(--Stroke-S, 0.5px))' }),
  };
  const svgStyle: React.CSSProperties = {
    display: 'block',
    height: '100%',
    width: 'auto',
    aspectRatio: `${vbWidth} / ${vbHeight}`,
    overflow: 'visible',
  };
  const fillStyle: React.CSSProperties = {
    fill: 'transparent',
    stroke: 'none',
  };
  const fallbackStrokeWidth = isGhost
    ? 'var(--Button-borderWidth-ghost, var(--Stroke-M))'
    : 'var(--Stroke-None)';
  const strokeStyle: React.CSSProperties = {
    fill: 'none',
    stroke: 'var(--Button-cssDecorationColor-active, var(--Button-borderColor-ghost, var(--_btn-default-low-stroke)))',
    strokeWidth: `var(--Button-cssDecorationInsetStrokeWidth-active, ${fallbackStrokeWidth})`,
    strokeLinecap: 'square',
    strokeLinejoin: 'round',
    vectorEffect: 'non-scaling-stroke',
  };

  return (
    <span data-ornament={side} style={wrapperStyle} aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        preserveAspectRatio="none"
        style={svgStyle}
      >
        <g transform={mirrorTransform}>
          <path d={fillPath} data-ornament-fill="" style={fillStyle} />
        </g>
        {strokePath && (
          <g transform={mirrorTransform}>
            <path d={strokePath} data-ornament-stroke="" style={strokeStyle} />
          </g>
        )}
      </svg>
    </span>
  );
}
