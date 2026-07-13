/**
 * TextTokenEditor.shared.ts
 * Shared types for text token mapping editor with contrast validation
 */

export type ThemeMode = 'light' | 'dark';

export interface TextTokenMapping {
  tokenName: string;
  lightModeStep: string;
  darkModeStep: string;
  dimModeStep: string;
  // Background token this text is typically used on
  targetBackground?: string;
}

export interface AvailableScaleWithColors {
  name: string;
  steps: number[];
  colors?: Array<{ step: number; hex: string }>;
  baseStep?: number;
}

export interface TextTokenEditorProps {
  mappings: TextTokenMapping[];
  availableScales: AvailableScaleWithColors[];
  // For contrast calculation
  surfaceMappings?: Array<{
    tokenName: string;
    lightModeStep: string;
    darkModeStep: string;
    dimModeStep: string;
  }>;
  onChange: (mappings: TextTokenMapping[]) => void;
  disabled?: boolean;
}

// Default text token definitions
export const DEFAULT_TEXT_TOKENS: TextTokenMapping[] = [
  {
    tokenName: 'Text-High',
    lightModeStep: 'Neutral-1100',
    darkModeStep: 'Neutral-50',
    dimModeStep: 'Neutral-0',
    targetBackground: 'Surface-Main',
  },
  {
    tokenName: 'Text-Medium',
    lightModeStep: 'Neutral-700',
    darkModeStep: 'Neutral-300',
    dimModeStep: 'Neutral-200',
    targetBackground: 'Surface-Main',
  },
  {
    tokenName: 'Text-Low',
    lightModeStep: 'Neutral-500',
    darkModeStep: 'Neutral-500',
    dimModeStep: 'Neutral-400',
    targetBackground: 'Surface-Main',
  },
  {
    tokenName: 'Text-OnBold-High',
    lightModeStep: 'Neutral-0',
    darkModeStep: 'Neutral-0',
    dimModeStep: 'Neutral-0',
    targetBackground: 'Surface-Bold',
  },
];

// Text token descriptions
export const TEXT_TOKEN_DESCRIPTIONS: Record<string, string> = {
  'Text-High': 'Primary text, headings, important content',
  'Text-Medium': 'Secondary text, labels, descriptions',
  'Text-Low': 'Tertiary text, captions, placeholders',
  'Text-OnBold-High': 'Text on bold/colored backgrounds',
};

// WCAG requirements
export const WCAG_REQUIREMENTS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const;
