/**
 * code.ts — EXP-01 / D-12 code emitter.
 *
 * Code export is the PERSISTED compiler output, NOT a re-generation. It reads the
 * `experienceArtifactVersions.compiledBundle.code` string (the React + Jio CSS TSX
 * the compiler emitted at generation time, persisted in `run/route.ts`) and the
 * resolved Jio CSS, and returns them verbatim. It NEVER invokes the IR generator
 * or the compiler — D-12 is explicit that code export is a read of the already-
 * persisted bundle, so a re-run cannot drift the exported code from what the user
 * saw, validated, and froze.
 *
 * This module imports NOTHING from `@oneui/experience-builder-agents` (no
 * `compiler` / `irGenerator` / `generate*`) — the grep gate in the plan enforces
 * that absence. It is a pure, deterministic transform: bytes in → bytes out.
 */

/** The persisted compiled bundle (mirror of the Convex `compiledBundle` shape). */
export interface CompiledBundleInput {
  /** The React + Jio CSS TSX source the compiler emitted (persisted, D-07/D-12). */
  code: string;
  /** Optional compile metadata (opaque; not consumed by the emitter). */
  meta?: unknown;
}

export interface ExportCodeInput {
  /** The PERSISTED compiled bundle (read from `compiledBundle`, never re-generated). */
  compiledBundle: CompiledBundleInput;
  /** The resolved Jio CSS for the artifact's brand/theme. */
  css: string;
}

export interface ExportCodeResult {
  /** The exact persisted TSX, verbatim — no transformation, no re-generation. */
  code: string;
  /** The resolved Jio CSS, verbatim. */
  css: string;
}

/**
 * Emit the code-export payload (EXP-01 / D-12): the PERSISTED `compiledBundle.code`
 * (the compiler's TSX, unchanged) bundled with the resolved Jio CSS. No
 * re-generation — the input `code` is returned verbatim.
 */
export function exportCode(input: ExportCodeInput): ExportCodeResult {
  // Verbatim pass-through — the persisted bundle IS the source of truth (D-12).
  // No compiler/generator call; the string is returned exactly as stored.
  return {
    code: input.compiledBundle.code,
    css: input.css,
  };
}
