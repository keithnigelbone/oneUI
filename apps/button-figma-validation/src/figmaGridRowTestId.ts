/**
 * Stable `data-testrow` ids for the Button Figma parity grid (browser + Node).
 * Row shape matches `figma-parity.fixture.json` → `meta.grid.rows.combinations[]`.
 */
export interface FigmaButtonGridRow {
  variant: string;
  attention: string;
  state: string;
  condensed: boolean;
  contained: boolean;
  fullWidth: boolean;
  start: boolean;
  end: boolean;
}

/** One id per `<tr>` (all size columns: XS, S, M, L in that row). */
export function figmaButtonGridRowTestId(row: FigmaButtonGridRow): string {
  return [
    row.variant,
    row.attention,
    row.state,
    row.condensed ? 'c1' : 'c0',
    row.contained ? 'in1' : 'in0',
    row.fullWidth ? 'fw1' : 'fw0',
    row.start ? 's1' : 's0',
    row.end ? 'e1' : 'e0',
  ].join('-');
}
