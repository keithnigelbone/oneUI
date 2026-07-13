/**
 * artifactTypes.ts
 *
 * The canonical artifact-type enum (8 members) and the full canvas card-kind
 * union (13 members) for the Jio Experience Builder Lab.
 *
 * Per D-05 the FULL union is defined now — production-shaped so later phases
 * just light up renderers rather than migrating the schema. P1 renders only a
 * thin subset (D-06: prompt / artifact / foundation-profile / component-
 * reference); every other member is contract-present but renders as a generic
 * placeholder until its phase.
 *
 * Counter-pattern note: this mirrors the *role* of `ASTNode`'s union in
 * `@oneui/shared` componentAST, but carries NO markup-bearing member (no
 * `element`/`tag`). Artifact types are output kinds, never HTML tags.
 *
 * Pure-TS, JSON-compatible: Zod enums + inferred TS types only.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Artifact types (8) — D-05 / INPUT-02 / INPUT-03
// ---------------------------------------------------------------------------

/** The 8 generatable artifact types. */
export const ARTIFACT_TYPES = [
  'web-ui',
  'app-screen',
  'dashboard',
  'social-post',
  'instagram-carousel',
  'outdoor-display',
  'slide',
  'image',
] as const;

export const ArtifactTypeSchema = z.enum(ARTIFACT_TYPES);

/** One of the 8 artifact types. */
export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;

// ---------------------------------------------------------------------------
// Canvas card kinds (13) — the full object-model union (D-05)
// ---------------------------------------------------------------------------

/**
 * Non-artifact card kinds that also live on the canvas. Combined with the 8
 * artifact types these form the full 13-member union.
 */
export const NON_ARTIFACT_CARD_KINDS = [
  'foundation-profile',
  'component-reference',
  'evaluation-report',
  'variant-group',
  'export',
] as const;

/**
 * The full 13-member canvas card-kind union:
 *   8 artifact types + 5 non-artifact card kinds.
 */
export const CARD_KINDS = [...ARTIFACT_TYPES, ...NON_ARTIFACT_CARD_KINDS] as const;

export const CardKindSchema = z.enum(CARD_KINDS);

/** One of the 13 canvas card kinds. */
export type CardKind = z.infer<typeof CardKindSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Type guard: is `value` one of the 8 artifact types? */
export function isArtifactType(value: unknown): value is ArtifactType {
  return ArtifactTypeSchema.safeParse(value).success;
}

/** Type guard: is `value` one of the 13 card kinds? */
export function isCardKind(value: unknown): value is CardKind {
  return CardKindSchema.safeParse(value).success;
}
