/**
 * AccessibilityMatrix.shared.ts
 * Shared types for WCAG contrast validation matrix
 */

import type { SurfaceTokenMapping } from './SurfaceTokenEditor.shared';
import type { TextTokenMapping } from './TextTokenEditor.shared';

export type ThemeMode = 'light' | 'dark';

export interface AccessibilityMatrixProps {
  textMappings: TextTokenMapping[];
  surfaceMappings: SurfaceTokenMapping[];
  // For color generation
  primaryHue?: number;
  primaryChroma?: number;
  // Theme mode to display
  activeMode?: ThemeMode;
  // Callback when mode changes
  onModeChange?: (mode: ThemeMode) => void;
}

export interface ContrastCell {
  textToken: string;
  surfaceToken: string;
  textStep: string;
  surfaceStep: string;
  textColor: string | null;
  surfaceColor: string | null;
  ratio: number | null;
  passesAA: boolean;
  passesAALarge: boolean;
  passesAAA: boolean;
}

// WCAG level display info
export const WCAG_LEVEL_INFO = {
  AAA: {
    label: 'AAA',
    description: 'Enhanced contrast - passes AAA (7:1+)',
    minRatio: 7,
  },
  AA: {
    label: 'AA',
    description: 'Standard contrast - passes AA (4.5:1+)',
    minRatio: 4.5,
  },
  'AA Large': {
    label: 'AA Large',
    description: 'Large text only - passes AA Large (3:1+)',
    minRatio: 3,
  },
  Fail: {
    label: 'Fail',
    description: 'Insufficient contrast (<3:1)',
    minRatio: 0,
  },
} as const;

// Mode labels for display
export const MODE_LABELS: Record<ThemeMode, string> = {
  light: 'Light Mode',
  dark: 'Dark Mode',
};
