/**
 * elevation.ts
 *
 * Elevation utilities implementing the two-shadow formula
 * for consistent, physically-based elevation effects.
 */

/**
 * Elevation levels (0-5)
 */
export const ELEVATION_LEVELS = [0, 1, 2, 3, 4, 5] as const;
export type ElevationLevel = (typeof ELEVATION_LEVELS)[number];

/**
 * Shadow configuration for a single light source
 */
export interface ShadowConfig {
  yOffset: number;
  blur: number;
  opacity: number;
}

/**
 * Complete elevation configuration
 */
export interface ElevationConfig {
  level: ElevationLevel;
  keyLight: ShadowConfig;
  ambientLight: ShadowConfig;
  darkModeStroke?: {
    color: string;
    opacity: number;
  };
}

/**
 * Surface brightness levels affecting shadow opacity
 */
export type SurfaceBrightness = 'low' | 'medium' | 'high';

/**
 * Opacity values based on surface brightness
 */
const SURFACE_OPACITY: Record<SurfaceBrightness, number> = {
  low: 0.08, // Light backgrounds
  medium: 0.12,
  high: 0.16, // Dark backgrounds
};

/**
 * Calculate the shadow function value for a given level
 * f(level) = level^1.5 × 2
 */
function shadowFunction(level: ElevationLevel): number {
  if (level === 0) return 0;
  return Math.pow(level, 1.5) * 2;
}

/**
 * Generate elevation configuration for a single level
 */
export function generateElevationLevel(
  level: ElevationLevel,
  surfaceBrightness: SurfaceBrightness = 'low'
): ElevationConfig {
  const f = shadowFunction(level);
  const baseOpacity = SURFACE_OPACITY[surfaceBrightness];

  return {
    level,
    keyLight: {
      yOffset: f * 0.5,
      blur: f,
      opacity: level === 0 ? 0 : baseOpacity,
    },
    ambientLight: {
      yOffset: f * 0.25,
      blur: f + 6,
      opacity: level === 0 ? 0 : baseOpacity,
    },
    darkModeStroke:
      level > 0
        ? {
            color: 'rgba(255, 255, 255, 0.1)',
            opacity: 0.1,
          }
        : undefined,
  };
}

/**
 * Generate all elevation levels
 */
export function generateAllElevations(
  surfaceBrightness: SurfaceBrightness = 'low'
): ElevationConfig[] {
  return ELEVATION_LEVELS.map((level) =>
    generateElevationLevel(level, surfaceBrightness)
  );
}

/**
 * Convert elevation config to CSS box-shadow value
 */
export function elevationToCss(
  config: ElevationConfig,
  isDarkMode: boolean = false
): string {
  if (config.level === 0) return 'none';

  const { keyLight, ambientLight, darkModeStroke } = config;

  // Adjust opacity for dark mode
  const opacityMultiplier = isDarkMode ? 1.5 : 1;
  const keyOpacity = keyLight.opacity * opacityMultiplier;
  const ambientOpacity = ambientLight.opacity * opacityMultiplier;

  let shadow = '';

  // Add dark mode stroke first (inset)
  if (isDarkMode && darkModeStroke) {
    shadow += `inset 0 0 0 1px ${darkModeStroke.color}, `;
  }

  // Key light shadow (primary, sharper)
  shadow += `0 ${keyLight.yOffset.toFixed(1)}px ${keyLight.blur.toFixed(1)}px rgba(0, 0, 0, ${keyOpacity.toFixed(3)}), `;

  // Ambient light shadow (softer, more spread)
  shadow += `0 ${ambientLight.yOffset.toFixed(1)}px ${ambientLight.blur.toFixed(1)}px rgba(0, 0, 0, ${ambientOpacity.toFixed(3)})`;

  return shadow;
}

/**
 * Generate CSS custom property for an elevation level
 */
export function elevationToCssVar(level: ElevationLevel): string {
  return `var(--Elevation-Level-${level})`;
}

/**
 * Generate complete CSS for all elevation levels
 */
export function generateElevationCss(isDarkMode: boolean = false): string {
  const lines: string[] = [];
  const surfaceBrightness = isDarkMode ? 'high' : 'low';

  for (const level of ELEVATION_LEVELS) {
    const config = generateElevationLevel(level, surfaceBrightness);
    const shadow = elevationToCss(config, isDarkMode);
    lines.push(`--Elevation-Level-${level}: ${shadow};`);
  }

  return lines.join('\n');
}

/**
 * Get usage recommendations for each elevation level
 */
export function getElevationUsage(level: ElevationLevel): string {
  const usageMap: Record<ElevationLevel, string> = {
    0: 'Default state, flat surfaces, most components',
    1: 'Card hover, subtle lift, focused elements',
    2: 'Elevated cards, raised sections',
    3: 'Dropdowns, popovers, menus',
    4: 'Modals, dialogs, bottom sheets',
    5: 'Toasts, notifications, floating action buttons',
  };
  return usageMap[level];
}

/**
 * Get the recommended elevation for a component type
 */
export function getRecommendedElevation(
  componentType:
    | 'card'
    | 'card-hover'
    | 'dropdown'
    | 'modal'
    | 'toast'
    | 'fab'
    | 'popover'
): ElevationLevel {
  const recommendations: Record<typeof componentType, ElevationLevel> = {
    card: 0,
    'card-hover': 1,
    dropdown: 3,
    modal: 4,
    toast: 5,
    fab: 5,
    popover: 3,
  };
  return recommendations[componentType];
}

/**
 * Validate elevation level
 */
export function isValidElevationLevel(level: number): level is ElevationLevel {
  return ELEVATION_LEVELS.includes(level as ElevationLevel);
}

/**
 * Calculate shadow spread for a given level (for visual reference)
 */
export function getShadowSpread(level: ElevationLevel): {
  width: number;
  height: number;
} {
  const f = shadowFunction(level);
  return {
    width: f * 2 + 12, // Key blur + ambient blur spread
    height: f * 0.75 + f + 6, // Max y-offset + ambient blur
  };
}

/**
 * Get all elevation levels
 */
export function getElevationLevels(): ElevationLevel[] {
  return [...ELEVATION_LEVELS];
}

/**
 * Elevation animation helper - get transition for smooth elevation changes
 */
export function getElevationTransition(
  duration: string = '150ms',
  easing: string = 'ease-out'
): string {
  return `box-shadow ${duration} ${easing}`;
}
