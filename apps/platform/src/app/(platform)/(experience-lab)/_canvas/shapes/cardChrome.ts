/**
 * cardChrome.ts
 *
 * Shared, token-only inline-style fragments for the Experience Lab card
 * `HTMLContainer` chrome. Centralising these keeps every shape's HTML chrome
 * on Jio tokens (LAB-02 zero-literals) with no duplication. tldraw shape
 * GEOMETRY (Rectangle2d width/height) is canvas-coordinate space and exempt;
 * everything here is the HTML rendered INSIDE the container and is NOT exempt.
 *
 * All values are `var(--Token-Name)` only. Typography always pairs a size with
 * its line-height token + `font-family: var(--Typography-Font-Primary)` per the
 * CLAUDE.md MANDATORY typography rule.
 */

import type { CSSProperties, WheelEvent } from 'react';

export function createRoundedRectIndicatorPath(
  width: number,
  height: number,
  radius: number = 8
): Path2D {
  const path = new Path2D();
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));

  path.moveTo(r, 0);
  path.lineTo(width - r, 0);
  path.quadraticCurveTo(width, 0, width, r);
  path.lineTo(width, height - r);
  path.quadraticCurveTo(width, height, width - r, height);
  path.lineTo(r, height);
  path.quadraticCurveTo(0, height, 0, height - r);
  path.lineTo(0, r);
  path.quadraticCurveTo(0, 0, r, 0);
  path.closePath();

  return path;
}

/** Outer card container — default surface, soft radius, subtle elevation. */
export const cardShell: CSSProperties = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3)',
  padding: 'var(--Spacing-4)',
  borderRadius: 'var(--Shape-4)',
  boxShadow: 'var(--Elevation-1)',
  overflow: 'auto',
  overscrollBehavior: 'contain',
};

/** Card title — Title-M role (fixed DS weight). */
export const cardTitle: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Title-M-FontSize)',
  fontWeight: 'var(--Title-M-FontWeight)',
  lineHeight: 'var(--Title-M-LineHeight)',
  color: 'var(--Text-High)',
};

/** Body / IR-summary / gap-report description — Body-S Low. */
export const cardBody: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  fontWeight: 'var(--Body-FontWeight-Low)',
  lineHeight: 'var(--Body-S-LineHeight)',
  color: 'var(--Text-Medium)',
};

/** UI label / control text — Label-S Medium. */
export const cardLabel: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  lineHeight: 'var(--Label-S-LineHeight)',
  color: 'var(--Text-High)',
};

/** Micro / meta text — Label-XS Low. */
export const cardMeta: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  color: 'var(--Text-Medium)',
};

/** Inspector / code text — Code-M (mono, JetBrains). */
export const cardCode: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--Typography-Font-Code)',
  fontSize: 'var(--Code-M-FontSize)',
  fontWeight: 'var(--Code-FontWeight-Medium)',
  lineHeight: 'var(--Code-M-LineHeight)',
  color: 'var(--Text-High)',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

/** A small key/value meta row used in IR summaries. */
export const metaRow: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 'var(--Spacing-2)',
};

/** Scroll region for long IR/JSON inspector content. */
export const inspectorScroll: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  borderRadius: 'var(--Shape-3)',
  padding: 'var(--Spacing-3)',
};

/**
 * The CANVAS-06 live-preview region wrapper. A fixed-aspect framed box holding
 * the lifecycle-driven iframe / thumbnail / placeholder. Token-only (LAB-02);
 * the aspect ratio is a layout primitive, not a visual literal.
 */
export const previewRegion: CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  overflow: 'hidden',
  borderRadius: 'var(--Shape-3)',
  backgroundColor: 'var(--Surface-Fill-Subtle, var(--Surface-Subtle))',
};

/** The live sandboxed preview iframe — fills the preview region, no border. */
export const previewIframe: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  border: 'none',
  display: 'block',
};

/** The thumbnail image shown in the `thumbnail` lifecycle — cover-fit. */
export const previewThumbnail: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

/** The `lightweight` / no-asset placeholder — centred meta label on a Surface. */
export const previewPlaceholder: CSSProperties = {
  width: '100%',
  aspectRatio: '16 / 9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--Shape-3)',
};

/** Keep wheel gestures inside scrollable HTML cards instead of panning tldraw. */
export function stopCanvasWheel(event: WheelEvent<HTMLElement>): void {
  event.stopPropagation();
}
