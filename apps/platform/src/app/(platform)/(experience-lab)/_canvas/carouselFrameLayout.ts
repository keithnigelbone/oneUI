/**
 * carouselFrameLayout.ts — CAMP-04 / D-07 ordered carousel group logic.
 *
 * Pure, framework-free ordering/label/status helpers for the ordered carousel
 * group. Extracted from `CarouselGroupFrame.tsx` (no React/tldraw import) so the
 * ORDERING + LABEL + STATUS logic is unit-testable in isolation. The tldraw
 * frame component consumes these; the geometry (left-to-right canvas placement)
 * lives in the component, the deterministic logic lives here.
 *
 * Copy strings are the UI-SPEC § Copywriting Contract values verbatim
 * ("Carousel: {name}", "Frame {n} of {N}", "Valid IR", repair-exhausted heading).
 */

/** A frame outcome on the canvas (mirrors the agents `FrameOutcome`). */
export type CarouselFrameOutcome = 'artifact' | 'repair-exhausted' | 'gap';

/** The minimal frame shape the ordering helper needs. */
export interface OrderableFrame {
  orderIndex: number;
  outcome: CarouselFrameOutcome;
}

/** A per-frame status pill descriptor (Badge `appearance` + text). */
export interface FrameStatusPill {
  appearance: 'positive' | 'negative' | 'neutral';
  text: string;
}

/**
 * Sort carousel frames ascending by `orderIndex` (D-07) — the render order is
 * deterministic regardless of input order. Returns a NEW array (does not mutate
 * the input). Stable for equal indices (preserves input order among ties).
 */
export function orderCarouselFrames<T extends OrderableFrame>(frames: readonly T[]): T[] {
  return frames
    .map((frame, idx) => ({ frame, idx }))
    .sort((a, b) => a.frame.orderIndex - b.frame.orderIndex || a.idx - b.idx)
    .map(({ frame }) => frame);
}

/**
 * The 1-based human label for a frame ("Frame {index+1} of {total}"), from the
 * 0-based `orderIndex`. Matches the UI-SPEC copy.
 */
export function frameLabel(index: number, total: number): string {
  return `Frame ${index + 1} of ${total}`;
}

/** The carousel group heading ("Carousel: {direction name}"). UI-SPEC copy. */
export function carouselGroupLabel(directionName: string): string {
  return `Carousel: ${directionName}`;
}

/**
 * Map a frame's outcome to its per-frame status pill (UI-SPEC § Color + Copy).
 * A PURE per-frame function — evaluating one frame never affects another
 * (sibling isolation, D-09). Status is conveyed by TEXT + role, never colour
 * alone (WCAG AA).
 *   - artifact (validation passed) → positive "Valid IR"
 *   - repair-exhausted            → negative "Frame couldn't be made compliant"
 *   - gap                         → neutral "Not generated"
 */
export function frameStatusPill(outcome: CarouselFrameOutcome): FrameStatusPill {
  switch (outcome) {
    case 'artifact':
      return { appearance: 'positive', text: 'Valid IR' };
    case 'repair-exhausted':
      return { appearance: 'negative', text: "Frame couldn't be made compliant" };
    case 'gap':
    default:
      return { appearance: 'neutral', text: 'Not generated' };
  }
}

/**
 * The repair-exhausted body copy for a frame (UI-SPEC § Copywriting Contract).
 * 1-based frame number; the sibling-unaffected reassurance is part of the copy.
 */
export function repairExhaustedBody(index: number): string {
  return (
    `Frame ${index + 1} hit the repair limit. The other frames are unaffected — ` +
    `adjust the brief or direction and regenerate this frame.`
  );
}
