/**
 * spacingLadder.ts
 *
 * The ordered Spacing token ladder used by relational ("ramp") metric
 * decisions in the Global Component Theme. A ramp offset moves every
 * per-size baseline the same number of ladder steps, so size ramps keep
 * their ordering by construction (matching the f-step philosophy).
 *
 * Grid tokens (Spacing-Margin / Spacing-Gutter) are intentionally not on
 * the ladder — they are context values, not magnitudes.
 */

export const SPACING_LADDER: readonly string[] = [
  'Spacing-0',
  'Spacing-0-5',
  'Spacing-1',
  'Spacing-1-5',
  'Spacing-2',
  'Spacing-2-5',
  'Spacing-3',
  'Spacing-3-5',
  'Spacing-4',
  'Spacing-4-5',
  'Spacing-5',
  'Spacing-5-5',
  'Spacing-6',
  'Spacing-7',
  'Spacing-8',
  'Spacing-9',
  'Spacing-10',
  'Spacing-12',
  'Spacing-14',
  'Spacing-16',
  'Spacing-18',
  'Spacing-20',
  'Spacing-24',
  'Spacing-28',
  'Spacing-32',
  'Spacing-40',
];

const LADDER_INDEX = new Map<string, number>(SPACING_LADDER.map((token, index) => [token, index]));

export function isSpacingLadderToken(token: string): boolean {
  return LADDER_INDEX.has(token);
}

/**
 * Shift a Spacing token `steps` positions along the ladder, clamped to the
 * ladder ends. Unknown tokens are returned unchanged so callers can pass any
 * baseline value through safely.
 */
export function shiftSpacingToken(token: string, steps: number): string {
  const index = LADDER_INDEX.get(token);
  if (index === undefined || !Number.isFinite(steps)) return token;
  const target = Math.min(SPACING_LADDER.length - 1, Math.max(0, index + Math.round(steps)));
  return SPACING_LADDER[target];
}

/**
 * Parse a persisted ramp offset (stored as a string in theme selections).
 * Returns 0 for missing/invalid values so unset ramps are inert.
 */
export function parseRampOffset(raw: string | undefined): number {
  if (raw === undefined || raw === '') return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}
