/**
 * buildNativeElevation.ts
 *
 * Pure builder: Convex `elevationConfigs.levels` (or Jio defaults) → RN-friendly
 * shadow summaries per level. Web emits CSS `box-shadow` strings; RN applies one
 * shadow block per view on iOS (`shadow*` props) plus `elevation` on Android.
 */

export interface NativeElevationShadowLayer {
  yOffset: number;
  blur: number;
  opacity: number;
}

export interface NativeElevationLevelInput {
  level: number;
  keyLight: NativeElevationShadowLayer;
  ambientLight: NativeElevationShadowLayer;
  darkModeStroke?: { color: string; opacity: number };
}

export interface NativeElevationConfigInput {
  levels: NativeElevationLevelInput[];
}

/** One elevation step — use `ios` on iOS, `androidElevation` on Android. */
export interface ResolvedElevationLevel {
  level: number;
  ios: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
  androidElevation: number;
  /** Optional stroke hint for dark surfaces (hex + opacity) — caller paints border. */
  darkModeStroke?: { color: string; opacity: number };
}

export interface ResolvedNativeElevation {
  /** Lookup by elevation level (0–5). */
  byLevel: Record<number, ResolvedElevationLevel>;
  levels: number[];
}

function mergeLights(
  key: NativeElevationShadowLayer,
  amb: NativeElevationShadowLayer,
): ResolvedElevationLevel['ios'] {
  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: key.yOffset },
    shadowOpacity: Math.min(0.45, key.opacity + amb.opacity * 0.5),
    shadowRadius: Math.max(0.5, Math.max(key.blur, amb.blur)),
  };
}

function levelToAndroidElevation(level: number): number {
  if (level <= 0) return 0;
  const map: Record<number, number> = { 1: 2, 2: 4, 3: 8, 4: 12, 5: 16 };
  return map[level] ?? Math.min(24, level * 3);
}

function buildLevelRow(row: NativeElevationLevelInput): ResolvedElevationLevel {
  return {
    level: row.level,
    ios: mergeLights(row.keyLight, row.ambientLight),
    androidElevation: levelToAndroidElevation(row.level),
    darkModeStroke: row.darkModeStroke,
  };
}

/**
 * Jio default elevation rows — numeric extraction from
 * `packages/tokens/src/css/primitives.css` `--Elevation-1` … `--Elevation-5`
 * (two-light formula). Level 0 is flat.
 */
const DEFAULT_ELEVATION_LEVELS: NativeElevationLevelInput[] = [
  {
    level: 0,
    keyLight: { yOffset: 0, blur: 0, opacity: 0 },
    ambientLight: { yOffset: 0, blur: 0, opacity: 0 },
  },
  {
    level: 1,
    keyLight: { yOffset: 1, blur: 3, opacity: 0.08 },
    ambientLight: { yOffset: 1, blur: 2, opacity: 0.06 },
  },
  {
    level: 2,
    keyLight: { yOffset: 3, blur: 6, opacity: 0.1 },
    ambientLight: { yOffset: 2, blur: 4, opacity: 0.06 },
  },
  {
    level: 3,
    keyLight: { yOffset: 10, blur: 20, opacity: 0.12 },
    ambientLight: { yOffset: 3, blur: 6, opacity: 0.08 },
  },
  {
    level: 4,
    keyLight: { yOffset: 15, blur: 25, opacity: 0.15 },
    ambientLight: { yOffset: 5, blur: 10, opacity: 0.08 },
  },
  {
    level: 5,
    keyLight: { yOffset: 20, blur: 40, opacity: 0.2 },
    ambientLight: { yOffset: 8, blur: 16, opacity: 0.1 },
  },
];

function toResolved(levels: NativeElevationLevelInput[]): ResolvedNativeElevation {
  const byLevel: Record<number, ResolvedElevationLevel> = {};
  for (const row of levels) {
    byLevel[row.level] = buildLevelRow(row);
  }
  return {
    byLevel,
    levels: levels.map((l) => l.level).sort((a, b) => a - b),
  };
}

/**
 * Build elevation bundle. Pass `null` or empty levels to use Jio defaults from
 * primitives.css shadow stack.
 */
export function buildNativeElevation(config: NativeElevationConfigInput | null): ResolvedNativeElevation {
  if (!config?.levels?.length) {
    return toResolved(DEFAULT_ELEVATION_LEVELS);
  }
  return toResolved(config.levels);
}
