/**
 * profilePlatformMap.ts
 *
 * The Lab's typed map from a non-web output profile to the brand Platforms
 * foundation target (`platformId` + `breakpointId`) that the foundation
 * resolver looks up to produce REAL, foundation-backed dimensions.
 *
 * D-01 / D-02 honesty rule: this file carries ONLY platform/breakpoint ids —
 * never literal width/height/aspect numbers. Dimensions come exclusively from
 * the brand's `PlatformsFoundationConfig` at resolve time. A profile with no
 * map entry (or whose mapped breakpoint is absent from a given brand's
 * foundation) resolves to the typed FND-03 gap, never a fabricated number.
 *
 * Only profiles whose target canvas exists in the DEFAULT Platforms seed
 * (`packages/shared/src/utils/platform-config.ts`) are wired today. Instagram
 * / slide canvases stay commented out until a brand seeds them, so the
 * resolver returns an honest gap instead of pointing at a non-existent canvas.
 *
 * Pure config: a typed const lookup + a single helper. No runtime deps.
 */

import type { OutputProfile } from './outputProfileTable';

/** The brand-foundation target a non-web profile resolves against. */
export interface PlatformTarget {
  /** PlatformEntry.id within the brand's PlatformsFoundationConfig. */
  platformId: string;
  /** PlatformBreakpoint.id within that platform. */
  breakpointId: string;
}

/**
 * Non-web `OutputProfile` → `{ platformId, breakpointId }`.
 *
 * `billboard-landscape` is the one entry resolvable against the DEFAULT seed:
 * the `outdoor` platform defines an `outdoor-billboard-large` breakpoint
 * (1920×1080, units px) — see `platform-config.ts`. No dimension numbers live
 * here; the breakpoint id is the only contract.
 *
 * The Instagram profiles point at the canonical `social` platform's matching
 * breakpoint ids. These canvases are NOT in the DEFAULT seed, so a default-seed
 * brand (which has no `social` platform) still resolves to an honest FND-03 gap
 * — the map entry only "lights up" once a brand seeds the matching canvas in its
 * Platforms foundation (D-02). Naming the target id is safe and honest: it says
 * WHERE the canvas would live, never a fabricated dimension.
 *
 * The remaining non-web profiles are intentionally absent. Uncomment a line
 * ONLY when a brand seeds the matching canvas in its Platforms foundation (D-02):
 *
 *   'ig-story':        { platformId: 'social', breakpointId: 'ig-story' },
 *   'slide-16x9':      { platformId: '<seeded>', breakpointId: '<seeded>' },
 *   'digital-portrait':{ platformId: '<seeded>', breakpointId: '<seeded>' },
 */
export const PROFILE_PLATFORM_MAP: Partial<Record<OutputProfile, PlatformTarget>> = {
  'billboard-landscape': { platformId: 'outdoor', breakpointId: 'outdoor-billboard-large' },
  // Instagram canvases — resolvable per-brand once the `social` platform canvas
  // is seeded; a brand without it still gaps honestly (D-02).
  'ig-square': { platformId: 'social', breakpointId: 'ig-square' },
  'ig-portrait': { platformId: 'social', breakpointId: 'ig-portrait' },
  'ig-carousel': { platformId: 'social', breakpointId: 'ig-carousel' },
};

/**
 * Look up the brand-foundation target for a non-web profile.
 * Returns `undefined` when the profile has no Lab map entry — the resolver
 * turns that into a typed FND-03 gap (never an invented dimension).
 */
export function getPlatformTargetForProfile(
  profile: OutputProfile,
): PlatformTarget | undefined {
  return PROFILE_PLATFORM_MAP[profile];
}
