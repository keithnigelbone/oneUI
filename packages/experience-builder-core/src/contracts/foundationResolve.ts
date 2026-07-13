/**
 * foundationResolve.ts
 *
 * The foundation-resolve contract: input + a discriminated-union result with a
 * FIRST-CLASS typed gap variant (FND-03).
 *
 * The mock resolver (plan 04, `experience-builder-agents`) and the eventual
 * real resolver (P2) both return this shape. The success arm's `theme` is
 * `ThemeConfig`-shaped so P2 is a data swap, not a migration — `ThemeConfig`
 * is `{ appearances: Record<string, ScaleDefinition> }` in
 * `@oneui/shared/engine` (imported as a type only; this package has no runtime
 * dependency on shared).
 *
 * Pitfall 6 guard: a "profile not found" / "no foundation coverage" outcome is
 * the typed `ok: false` gap variant — it NEVER returns invented round numbers
 * (e.g. 1080×1080). The gap short-circuits to the gap-report card and produces
 * no artifact.
 */

import { z } from 'zod';
import { ArtifactTypeSchema } from '../ir/artifactTypes';
import { OutputProfileSchema } from '../profiles/outputProfileTable';

// Type-only import: erased at build, no runtime dependency on @oneui/shared.
import type { ThemeConfig } from '@oneui/shared/engine';

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export const FoundationResolveInput = z
  .object({
    brandId: z.string().min(1),
    artifactType: ArtifactTypeSchema,
    outputProfile: OutputProfileSchema,
    /** Optional theme selection (light/dark/dim) — defaults applied downstream. */
    theme: z.enum(['light', 'dark', 'dim']).optional(),
  })
  .strict();
export type FoundationResolveInputT = z.infer<typeof FoundationResolveInput>;

// ---------------------------------------------------------------------------
// Result — discriminated union with first-class gap variant (FND-03)
// ---------------------------------------------------------------------------

/** The typed gap payload — carries NO dimension numbers (Pitfall 6). */
export const FoundationGap = z
  .object({
    artifactType: ArtifactTypeSchema,
    outputProfile: OutputProfileSchema,
    /** Human-readable reason; the resolver never fabricates a default profile. */
    reason: z.string().min(1),
  })
  .strict();
export type FoundationGapT = z.infer<typeof FoundationGap>;

/**
 * Foundation-resolved canvas geometry for a non-web profile (FND-02 / CAMP-05).
 *
 * Carried ONLY on the success arm, and ONLY for non-web profiles whose target
 * canvas exists in the brand's Platforms foundation. Every value here comes
 * from that foundation — never a fabricated number:
 *   - `width`/`height` are the foundation breakpoint's `viewportWidth`/`Height`
 *     in the breakpoint's own `units`. For `units: 'mm'` the numbers stay in mm
 *     (NOT pre-converted) so the export/raster path converts with `mmToPx(value,
 *     ppi)` downstream (plan 04). `ppi` (pixels-per-inch: 72/96/300) drives that
 *     conversion; `pixelDensity` (device pixel ratio: 1/2/3) is a SEPARATE value
 *     that drives the raster `deviceScaleFactor`. The two are distinct foundation
 *     fields — never conflate them (a print canvas is 300 ppi at 1× density).
 *   - `safeAreaInsetToken` is a Jio `Spacing-N` token name (D-03), never a raw
 *     px margin. A platform margin with no matching token is a gap, not a number.
 *
 * Optional so web callers and `FoundationResolveResultSchema` stay valid.
 */
export const ResolvedDimensions = z
  .object({
    width: z.number(),
    height: z.number(),
    units: z.enum(['px', 'mm']),
    /** Pixels per inch (72/96/300). Drives `mmToPx` for `units: 'mm'` canvases. */
    ppi: z.number(),
    /** Device pixel ratio (1/2/3). Drives the raster `deviceScaleFactor`. */
    pixelDensity: z.number(),
    /** Jio `Spacing-N` token name (e.g. `Spacing-4`); never a raw px value. */
    safeAreaInsetToken: z.string().optional(),
  })
  .strict();
export type ResolvedDimensionsT = z.infer<typeof ResolvedDimensions>;

/**
 * Discriminated on `ok`:
 *   - ok: true  → `theme` is ThemeConfig-shaped (success). Non-web profiles also
 *     carry `resolvedDimensions` (foundation-backed geometry); web profiles omit it.
 *   - ok: false → `gap` is the typed gap-report payload (no artifact produced).
 *
 * `theme` is typed via the shared `ThemeConfig` so consumers get full structural
 * typing; at the schema level it is validated as an object (the engine owns its
 * own deep validation), keeping `-core` free of a runtime shared dependency.
 */
export type FoundationResolveResult =
  | { ok: true; theme: ThemeConfig; resolvedDimensions?: ResolvedDimensionsT }
  | { ok: false; gap: FoundationGapT };

/** Zod schema for runtime validation / transport of the result union. */
export const FoundationResolveResultSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    // ThemeConfig = { appearances: Record<string, ScaleDefinition> }; validate
    // the envelope, defer deep scale validation to the engine.
    theme: z.object({ appearances: z.record(z.string(), z.unknown()) }),
    // Non-web foundation geometry. Optional → web results stay valid.
    resolvedDimensions: ResolvedDimensions.optional(),
  }),
  z.object({
    ok: z.literal(false),
    gap: FoundationGap,
  }),
]);

// ---------------------------------------------------------------------------
// Constructors (so callers never hand-build the union shape)
// ---------------------------------------------------------------------------

export function foundationResolved(
  theme: ThemeConfig,
  resolvedDimensions?: ResolvedDimensionsT,
): FoundationResolveResult {
  return resolvedDimensions
    ? { ok: true, theme, resolvedDimensions }
    : { ok: true, theme };
}

export function foundationGap(gap: FoundationGapT): FoundationResolveResult {
  return { ok: false, gap };
}
