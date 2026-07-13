/**
 * SurfaceTokenEditor.shared.ts
 * Shared types for surface token mapping editor
 *
 * APPEARANCE SYSTEM:
 * The theme is composed of 4 appearance colors:
 * - Primary: Main brand color (has Default, Minimal, Subtle, Bold, Elevated surfaces)
 * - Secondary: Complementary color (has Default, Minimal, Subtle, Bold, Elevated surfaces)
 * - Sparkle: Accent/highlight color (has Default, Minimal, Subtle, Bold, Elevated surfaces)
 * - Background: Page/container background (single surface with mode variants)
 *
 * SURFACE LEVELS (Rang De naming convention):
 * - Default: Base surface (same as background)
 * - Minimal: +1 step from background
 * - Subtle: +2 steps from background
 * - Bold: High emphasis, CTAs, buttons (with contrast checking)
 * - Elevated: Same as default + elevation shadow
 */

export type ThemeMode = 'light' | 'dark';

/** Appearance color types */
export type AppearanceColor = 'primary' | 'secondary' | 'sparkle' | 'background';

/** Surface emphasis levels (Rang De naming) */
export type SurfaceLevel = 'default' | 'minimal' | 'subtle' | 'bold' | 'elevated';

export interface SurfaceTokenMapping {
  tokenName: string;
  lightModeStep: string;
  darkModeStep: string;
  dimModeStep: string;
}

export interface ScaleStepColor {
  step: number;
  hex: string;
}

export interface AvailableScale {
  name: string;
  steps: number[];
  /** Optional color data for each step - if provided, used for preview */
  colors?: ScaleStepColor[];
  /** The base step of the scale (for highlighting in dropdown) */
  baseStep?: number;
}

export interface SurfaceTokenEditorProps {
  mappings: SurfaceTokenMapping[];
  availableScales: AvailableScale[];
  onChange: (mappings: SurfaceTokenMapping[]) => void;
  disabled?: boolean;
}

/**
 * Default surface token definitions (Rang De naming convention)
 * Valid steps: 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500
 *
 * Structure: {Appearance}-{SurfaceLevel}
 * Example: Primary-Bold, Secondary-Subtle, Background
 *
 * Surface Levels (Rang De):
 * - Default: Base surface (same as background)
 * - Minimal: +1 step from background
 * - Subtle: +2 steps from background
 * - Bold: High contrast (computed with WCAG checking)
 * - Elevated: Same as default + shadow
 */
export const DEFAULT_SURFACE_TOKENS: SurfaceTokenMapping[] = [
  // Background (single surface - page/container background)
  {
    tokenName: 'Background',
    lightModeStep: 'Neutral-2500',  // White
    darkModeStep: 'Neutral-200',    // Near black
    dimModeStep: 'Neutral-300',     // Slightly lighter
  },

  // Primary surfaces (Rang De naming)
  {
    tokenName: 'Primary-Default',
    lightModeStep: 'Primary-2500',  // Same as background
    darkModeStep: 'Primary-200',
    dimModeStep: 'Primary-300',
  },
  {
    tokenName: 'Primary-Minimal',
    lightModeStep: 'Primary-2400',  // +1 step from background
    darkModeStep: 'Primary-300',
    dimModeStep: 'Primary-400',
  },
  {
    tokenName: 'Primary-Subtle',
    lightModeStep: 'Primary-2300',  // +2 steps from background
    darkModeStep: 'Primary-400',
    dimModeStep: 'Primary-500',
  },
  {
    tokenName: 'Primary-Bold',
    lightModeStep: 'Primary-1300',  // High contrast (base step area)
    darkModeStep: 'Primary-1300',
    dimModeStep: 'Primary-1300',
  },
  {
    tokenName: 'Primary-Elevated',
    lightModeStep: 'Primary-2500',  // Same as default + shadow
    darkModeStep: 'Primary-300',    // Slightly lighter in dark mode
    dimModeStep: 'Primary-400',
  },

  // Secondary surfaces (Rang De naming)
  {
    tokenName: 'Secondary-Default',
    lightModeStep: 'Secondary-2500',
    darkModeStep: 'Secondary-200',
    dimModeStep: 'Secondary-300',
  },
  {
    tokenName: 'Secondary-Minimal',
    lightModeStep: 'Secondary-2400',
    darkModeStep: 'Secondary-300',
    dimModeStep: 'Secondary-400',
  },
  {
    tokenName: 'Secondary-Subtle',
    lightModeStep: 'Secondary-2300',
    darkModeStep: 'Secondary-400',
    dimModeStep: 'Secondary-500',
  },
  {
    tokenName: 'Secondary-Bold',
    lightModeStep: 'Secondary-1300',
    darkModeStep: 'Secondary-1300',
    dimModeStep: 'Secondary-1300',
  },
  {
    tokenName: 'Secondary-Elevated',
    lightModeStep: 'Secondary-2500',
    darkModeStep: 'Secondary-300',
    dimModeStep: 'Secondary-400',
  },

  // Sparkle surfaces (Rang De naming)
  {
    tokenName: 'Sparkle-Default',
    lightModeStep: 'Primary-2500',   // Falls back to Primary if no Sparkle scale
    darkModeStep: 'Primary-200',
    dimModeStep: 'Primary-300',
  },
  {
    tokenName: 'Sparkle-Minimal',
    lightModeStep: 'Primary-2400',
    darkModeStep: 'Primary-300',
    dimModeStep: 'Primary-400',
  },
  {
    tokenName: 'Sparkle-Subtle',
    lightModeStep: 'Primary-2300',
    darkModeStep: 'Primary-400',
    dimModeStep: 'Primary-500',
  },
  {
    tokenName: 'Sparkle-Bold',
    lightModeStep: 'Primary-1300',
    darkModeStep: 'Primary-1300',
    dimModeStep: 'Primary-1300',
  },
  {
    tokenName: 'Sparkle-Elevated',
    lightModeStep: 'Primary-2500',
    darkModeStep: 'Primary-300',
    dimModeStep: 'Primary-400',
  },
];

/** Surface token descriptions (Rang De naming) */
export const SURFACE_TOKEN_DESCRIPTIONS: Record<string, string> = {
  // Background
  'Background': 'Page and container background',

  // Primary surfaces (Rang De naming)
  'Primary-Default': 'Base primary surface (same as background)',
  'Primary-Minimal': 'Low-emphasis primary surface (+1 step)',
  'Primary-Subtle': 'Medium-emphasis primary surface (+2 steps)',
  'Primary-Bold': 'High-emphasis primary surface for CTAs and buttons',
  'Primary-Elevated': 'Elevated primary surface with shadow',

  // Secondary surfaces (Rang De naming)
  'Secondary-Default': 'Base secondary surface',
  'Secondary-Minimal': 'Low-emphasis secondary surface (+1 step)',
  'Secondary-Subtle': 'Medium-emphasis secondary surface (+2 steps)',
  'Secondary-Bold': 'High-emphasis secondary surface',
  'Secondary-Elevated': 'Elevated secondary surface with shadow',

  // Sparkle surfaces (Rang De naming)
  'Sparkle-Default': 'Base sparkle/accent surface',
  'Sparkle-Minimal': 'Low-emphasis sparkle surface (+1 step)',
  'Sparkle-Subtle': 'Medium-emphasis sparkle surface (+2 steps)',
  'Sparkle-Bold': 'High-emphasis sparkle/accent surface',
  'Sparkle-Elevated': 'Elevated sparkle surface with shadow',
};

/** Appearance colors with their surface levels (Rang De naming) */
export const APPEARANCE_STRUCTURE = {
  background: {
    label: 'Background',
    surfaces: ['Background'] as const,
    description: 'Page and container backgrounds',
  },
  primary: {
    label: 'Primary',
    surfaces: ['Primary-Default', 'Primary-Minimal', 'Primary-Subtle', 'Primary-Bold', 'Primary-Elevated'] as const,
    description: 'Main brand color surfaces',
  },
  secondary: {
    label: 'Secondary',
    surfaces: ['Secondary-Default', 'Secondary-Minimal', 'Secondary-Subtle', 'Secondary-Bold', 'Secondary-Elevated'] as const,
    description: 'Complementary color surfaces',
  },
  sparkle: {
    label: 'Sparkle',
    surfaces: ['Sparkle-Default', 'Sparkle-Minimal', 'Sparkle-Subtle', 'Sparkle-Bold', 'Sparkle-Elevated'] as const,
    description: 'Accent/highlight color surfaces',
  },
} as const;

// Helper to parse step reference
export function parseStepReference(ref: string): {
  scale: string;
  step: number;
} | null {
  if (ref === 'transparent') return null;
  const match = ref.match(/^(\w+)-(\d+)$/);
  if (!match) return null;
  return { scale: match[1], step: parseInt(match[2], 10) };
}

// Helper to create step reference
export function createStepReference(scale: string, step: number): string {
  return `${scale}-${step}`;
}
