/**
 * outputProfileTable.ts
 *
 * The artifact-type → valid-output-profile mapping (D-03). This is the single
 * source of truth the request-panel UI uses to FILTER the output-profile
 * selector by the selected artifact type (invalid type/profile pairs are
 * unselectable at the UI, not merely rejected downstream).
 *
 * P1 honesty rule (Pitfall 6 / FND-03): web profiles carry REAL dimension
 * values; non-web profiles are structurally present (so P4 just lights them
 * up) but their dimension/aspect/safe-area values are explicit placeholders,
 * NEVER invented round numbers presented as fact. A profile whose foundation
 * coverage is unverified is marked `coverage: 'assumed'` so the foundation
 * resolver can short-circuit to a typed gap report instead of fabricating.
 *
 * Pure config: a typed const lookup table + helper functions. No runtime deps.
 */

import { z } from 'zod';
import { ARTIFACT_TYPES, type ArtifactType } from '../ir/artifactTypes';

// ---------------------------------------------------------------------------
// Output-profile identifiers
// ---------------------------------------------------------------------------

/** Every output-profile id across all artifact types. */
export const OUTPUT_PROFILES = [
  // web-ui
  'web-desktop',
  'web-mobile',
  'web-responsive',
  // app-screen
  'app-phone',
  'app-tablet',
  // dashboard
  'dashboard-desktop',
  'dashboard-wide',
  // social-post + instagram-carousel
  'ig-square',
  'ig-portrait',
  'ig-story',
  'ig-carousel',
  // outdoor-display
  'billboard-landscape',
  'digital-portrait',
  // slide
  'slide-16x9',
  'slide-4x3',
  // image
  'image-freeform',
] as const;

export const OutputProfileSchema = z.enum(OUTPUT_PROFILES);
export type OutputProfile = z.infer<typeof OutputProfileSchema>;

// ---------------------------------------------------------------------------
// Per-profile descriptor
// ---------------------------------------------------------------------------

/** Whether a profile's foundation coverage is real (web) or assumed (non-web, P4). */
export type ProfileCoverage = 'real' | 'assumed';

export interface OutputProfileDescriptor {
  readonly id: OutputProfile;
  readonly label: string;
  /**
   * Pixel dimensions. `null` for genuinely fluid profiles (responsive/freeform)
   * — never a fabricated number. Non-web placeholder dimensions are flagged via
   * `coverage: 'assumed'`.
   */
  readonly dimensions: { readonly width: number; readonly height: number } | null;
  /** Aspect ratio as a "W:H" string, or `null` when fluid. */
  readonly aspect: string | null;
  /** Safe-area inset placeholder (px). `null` until a profile defines one. */
  readonly safeAreaInset: number | null;
  /** Export rule placeholder — the emitter family this profile targets (P4). */
  readonly exportRule: 'web-code' | 'raster-png' | 'raster-jpg' | 'pdf' | 'none';
  readonly coverage: ProfileCoverage;
}

// ---------------------------------------------------------------------------
// The table — artifact type → ordered list of valid profile descriptors
// ---------------------------------------------------------------------------

export const outputProfileTable: Readonly<
  Record<ArtifactType, ReadonlyArray<OutputProfileDescriptor>>
> = {
  'web-ui': [
    { id: 'web-desktop', label: 'Desktop', dimensions: { width: 1440, height: 1024 }, aspect: null, safeAreaInset: null, exportRule: 'web-code', coverage: 'real' },
    { id: 'web-mobile', label: 'Mobile', dimensions: { width: 390, height: 844 }, aspect: null, safeAreaInset: null, exportRule: 'web-code', coverage: 'real' },
    { id: 'web-responsive', label: 'Responsive', dimensions: null, aspect: null, safeAreaInset: null, exportRule: 'web-code', coverage: 'real' },
  ],
  'app-screen': [
    { id: 'app-phone', label: 'Phone', dimensions: { width: 390, height: 844 }, aspect: null, safeAreaInset: null, exportRule: 'web-code', coverage: 'real' },
    { id: 'app-tablet', label: 'Tablet', dimensions: { width: 834, height: 1194 }, aspect: null, safeAreaInset: null, exportRule: 'web-code', coverage: 'real' },
  ],
  dashboard: [
    { id: 'dashboard-desktop', label: 'Desktop', dimensions: { width: 1440, height: 1024 }, aspect: null, safeAreaInset: null, exportRule: 'web-code', coverage: 'real' },
    { id: 'dashboard-wide', label: 'Wide', dimensions: { width: 1920, height: 1080 }, aspect: null, safeAreaInset: null, exportRule: 'web-code', coverage: 'real' },
  ],
  'social-post': [
    // Non-web: structurally present for P4; dimensions are placeholders pending
    // the FND foundation-coverage audit → coverage: 'assumed'.
    { id: 'ig-square', label: 'IG Square', dimensions: null, aspect: '1:1', safeAreaInset: null, exportRule: 'raster-png', coverage: 'assumed' },
    { id: 'ig-portrait', label: 'IG Portrait', dimensions: null, aspect: '4:5', safeAreaInset: null, exportRule: 'raster-png', coverage: 'assumed' },
    { id: 'ig-story', label: 'IG Story', dimensions: null, aspect: '9:16', safeAreaInset: null, exportRule: 'raster-png', coverage: 'assumed' },
    { id: 'ig-carousel', label: 'IG Carousel', dimensions: null, aspect: '1:1', safeAreaInset: null, exportRule: 'raster-png', coverage: 'assumed' },
  ],
  'instagram-carousel': [
    { id: 'ig-carousel', label: 'IG Carousel', dimensions: null, aspect: '1:1', safeAreaInset: null, exportRule: 'raster-png', coverage: 'assumed' },
    { id: 'ig-portrait', label: 'IG Portrait', dimensions: null, aspect: '4:5', safeAreaInset: null, exportRule: 'raster-png', coverage: 'assumed' },
  ],
  'outdoor-display': [
    { id: 'billboard-landscape', label: 'Billboard (Landscape)', dimensions: null, aspect: '16:9', safeAreaInset: null, exportRule: 'raster-jpg', coverage: 'assumed' },
    { id: 'digital-portrait', label: 'Digital (Portrait)', dimensions: null, aspect: '9:16', safeAreaInset: null, exportRule: 'raster-jpg', coverage: 'assumed' },
  ],
  slide: [
    { id: 'slide-16x9', label: '16:9', dimensions: null, aspect: '16:9', safeAreaInset: null, exportRule: 'pdf', coverage: 'assumed' },
    { id: 'slide-4x3', label: '4:3', dimensions: null, aspect: '4:3', safeAreaInset: null, exportRule: 'pdf', coverage: 'assumed' },
  ],
  image: [
    { id: 'image-freeform', label: 'Freeform', dimensions: null, aspect: null, safeAreaInset: null, exportRule: 'raster-png', coverage: 'assumed' },
  ],
};

// ---------------------------------------------------------------------------
// Helpers (D-03 UI filtering source)
// ---------------------------------------------------------------------------

/** Valid profile descriptors for an artifact type (UI selector options). */
export function getValidProfilesForType(
  type: ArtifactType,
): ReadonlyArray<OutputProfileDescriptor> {
  return outputProfileTable[type] ?? [];
}

/** Is `profile` a valid output profile for `type`? (UI pairing guard.) */
export function isValidTypeProfilePair(
  type: ArtifactType,
  profile: OutputProfile,
): boolean {
  return getValidProfilesForType(type).some((p) => p.id === profile);
}

/** Coverage-audit helper: artifact types that have at least one profile entry. */
export function coveredArtifactTypes(): ReadonlyArray<ArtifactType> {
  return ARTIFACT_TYPES.filter((t) => getValidProfilesForType(t).length > 0);
}
