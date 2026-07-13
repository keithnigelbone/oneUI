/**
 * lifecycle.ts
 *
 * The PREV-03 preview lifecycle state machine + profile framing. Pure,
 * dependency-free, fully testable — the canvas card (Plan 06) drives the
 * transitions; this module only encodes the rules.
 *
 * The lifecycle escalates a preview from a cheap static `thumbnail`, to a
 * `lightweight` (e.g. cached screenshot / low-fidelity) render, to the `live`
 * separate-origin iframe. The canvas card upgrades a card as it scrolls into
 * view / is focused, and never needs to know the executor — it just advances
 * the state.
 *
 * Analog: `_canvas/shapes/ArtifactCardShape.tsx` card render-state, lifted to a
 * pure transition helper (partial — the shape keeps the React/tldraw chrome).
 */

import type { PreviewProfile } from './PreviewExecutor';

/** The three preview fidelity states, in escalation order. */
export type PreviewLifecycleState = 'thumbnail' | 'lightweight' | 'live';

/** Canonical escalation order — index encodes fidelity. */
export const LIFECYCLE_ORDER: readonly PreviewLifecycleState[] = [
  'thumbnail',
  'lightweight',
  'live',
] as const;

/**
 * Advance one fidelity step. `live` is terminal and returns itself (idempotent
 * — the canvas can call this on every intersection tick without overshooting).
 */
export function nextLifecycleState(
  state: PreviewLifecycleState,
): PreviewLifecycleState {
  const i = LIFECYCLE_ORDER.indexOf(state);
  if (i < 0 || i >= LIFECYCLE_ORDER.length - 1) return 'live';
  return LIFECYCLE_ORDER[i + 1];
}

/** True iff the state is the terminal `live` state. */
export function isLiveState(state: PreviewLifecycleState): boolean {
  return state === 'live';
}

/**
 * The PREV-03 framing for each capture profile (desktop / mobile / fixed).
 * `fixed` is the artboard-style profile from the RESEARCH spec (a square-ish
 * fixed canvas, e.g. social / outdoor); desktop + mobile mirror
 * `playwrightRenderer.ts`'s `DEFAULT_VIEWPORTS`.
 */
export const PROFILE_FRAMING: Record<
  PreviewProfile['name'],
  PreviewProfile
> = {
  desktop: { name: 'desktop', width: 1440, height: 900 },
  mobile: { name: 'mobile', width: 390, height: 844 },
  fixed: { name: 'fixed', width: 1080, height: 1080 },
};

/** Return the canonical framing (width/height) for a profile name. */
export function framingForProfile(
  name: PreviewProfile['name'],
): PreviewProfile {
  return PROFILE_FRAMING[name];
}

/** The default profile set the canvas requests for a fresh artifact. */
export const DEFAULT_PROFILES: readonly PreviewProfile[] = [
  PROFILE_FRAMING.desktop,
  PROFILE_FRAMING.mobile,
  PROFILE_FRAMING.fixed,
] as const;
