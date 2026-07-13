/**
 * validation.ts
 *
 * `JioValidationResult` (VAL-01) — the output of the AST-level compliance
 * validator (plan 04+, `experience-builder-validation`). The validator walks
 * the AST against registry/token allowlists (never string denylists, Pitfall
 * 5) and returns this structured result: pass/fail + blocking violations +
 * warnings + repair suggestions + typed gaps.
 *
 * Pure-TS, JSON-compatible: Zod schemas + inferred types.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Violation + warning
// ---------------------------------------------------------------------------

export const ViolationSeverity = z.enum(['blocking', 'warning']);
export type ViolationSeverityT = z.infer<typeof ViolationSeverity>;

/** A single validator finding, anchored to an AST node where possible. */
export const Violation = z
  .object({
    /** Machine code, e.g. 'non-jio-import', 'unregistered-component', 'literal-value'. */
    code: z.string().min(1),
    message: z.string().min(1),
    severity: ViolationSeverity,
    /** AST node id the finding is anchored to (if any). */
    nodeId: z.string().optional(),
    /** The offending value (component type, import path, literal) for context. */
    offender: z.string().optional(),
  })
  .strict();
export type ViolationT = z.infer<typeof Violation>;

// ---------------------------------------------------------------------------
// Gaps (mirror the foundation/component gap concept at validation time)
// ---------------------------------------------------------------------------

/** An unregistered component referenced by the AST → component gap. */
export const ComponentGap = z
  .object({
    componentType: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();
export type ComponentGapT = z.infer<typeof ComponentGap>;

/** A missing foundation/token referenced by the AST → foundation gap. */
export const FoundationGapRef = z
  .object({
    foundationRef: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();
export type FoundationGapRefT = z.infer<typeof FoundationGapRef>;

// ---------------------------------------------------------------------------
// Result (VAL-01)
// ---------------------------------------------------------------------------

export const JioValidationResult = z
  .object({
    /** True only when there are zero blocking violations. */
    passed: z.boolean(),
    blocking: z.array(Violation).default([]),
    warnings: z.array(Violation).default([]),
    /** Markup-free, human-readable repair suggestions. */
    repairSuggestions: z.array(z.string()).default([]),
    componentGaps: z.array(ComponentGap).default([]),
    foundationGaps: z.array(FoundationGapRef).default([]),
  })
  .strict();

export type JioValidationResultT = z.infer<typeof JioValidationResult>;

/** Convenience constructor for a clean pass. */
export function validationPassed(
  overrides: Partial<JioValidationResultT> = {},
): JioValidationResultT {
  return {
    passed: true,
    blocking: [],
    warnings: [],
    repairSuggestions: [],
    componentGaps: [],
    foundationGaps: [],
    ...overrides,
  };
}
