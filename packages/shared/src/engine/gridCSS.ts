/**
 * gridCSS.ts
 *
 * Generate per-brand grid CSS overrides for `--Grid-Columns` and
 * `--Grid-MaxWidth`. Emitted inside `@layer brand` by the useBrandCSS engine.
 *
 * Grid values are per-breakpoint (S/M/L, not density-scaled). --Grid-Margin and
 * --Grid-Gutter remain in the dimension scale (density-aware) and are not
 * emitted by this module.
 *
 * Brand grid overrides are keyed off `[data-Breakpoint="S|M|L"]` (the canonical
 * attribute). Every surface that renders brand previews sets `data-Breakpoint`.
 */

import type { BreakpointId } from '../data/dimension-scales';
import { BREAKPOINT_IDS } from '../data/dimension-scales';

export type ContainerDefaultVariant = 'fluid' | 'fixed' | 'full-bleed';

export interface GridPlatformConfig {
  /** Number of columns. Required. */
  columns: number;
  /**
   * Max-width cap (for fixed container variant). `null` = unbounded
   * ("software tool" mode). Pixel value otherwise.
   */
  maxWidth: number | null;
}

export interface BrandGridConfig {
  /** Per-breakpoint overrides (S/M/L). Only breakpoints differing from defaults need entries. */
  breakpoints?: Partial<Record<BreakpointId, GridPlatformConfig>>;
  /**
   * Default container variant for this brand. Informational — consumed by
   * the editor preview and documented defaults, not emitted as CSS.
   */
  defaultVariant?: ContainerDefaultVariant;
}

/**
 * Extract the breakpoint-keyed overrides from a grid config (idempotent).
 */
export function normalizeGridConfig(
  config: BrandGridConfig | null | undefined,
): Partial<Record<BreakpointId, GridPlatformConfig>> {
  const out: Partial<Record<BreakpointId, GridPlatformConfig>> = {};
  if (!config?.breakpoints) return out;

  for (const bp of BREAKPOINT_IDS) {
    const entry = config.breakpoints[bp];
    if (entry) out[bp] = entry;
  }

  return out;
}

/**
 * Emit `--Grid-Columns` and `--Grid-MaxWidth` declarations per breakpoint.
 *
 * Returns a single CSS string (without `@layer` wrapping — the caller is
 * responsible for placing this inside `@layer brand`).
 *
 * Empty string when the config has no breakpoint overrides.
 */
export function generateGridCSS(config: BrandGridConfig | null | undefined): string {
  const breakpoints = normalizeGridConfig(config);

  const blocks: string[] = [];
  for (const bp of BREAKPOINT_IDS) {
    const entry = breakpoints[bp];
    if (!entry) continue;

    const columns = Number.isFinite(entry.columns) ? Math.max(1, Math.round(entry.columns)) : null;
    if (columns === null) continue;

    const maxWidth =
      entry.maxWidth == null ? 'none' : `${Math.max(0, Math.round(entry.maxWidth))}px`;

    blocks.push(
      `[data-Breakpoint="${bp}"] {\n` +
      `  --Grid-Columns: ${columns};\n` +
      `  --Grid-MaxWidth: ${maxWidth};\n` +
      `}`,
    );
  }

  return blocks.join('\n\n');
}

/**
 * Convenience: is a brand grid config non-empty (has at least one breakpoint override)?
 */
export function hasGridOverrides(config: BrandGridConfig | null | undefined): boolean {
  const breakpoints = normalizeGridConfig(config);
  return BREAKPOINT_IDS.some((bp) => breakpoints[bp]);
}
