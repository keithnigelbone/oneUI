/**
 * ColorScaleGenerator.shared.ts
 * Shared types for color scale generator component
 */

export interface ColorScaleGeneratorProps {
  name: string;
  hue: number;
  chroma: number;
  baseStep: number;
  onChange: (updates: { hue?: number; chroma?: number; baseStep?: number }) => void;
  onNameChange?: (name: string) => void;
  disabled?: boolean;
}

export interface ColorScalePreviewProps {
  hue: number;
  chroma: number;
  baseStep: number;
  showValues?: boolean;
  compact?: boolean;
}

export const HUE_PRESETS = [
  { name: 'Red', value: 25 },
  { name: 'Orange', value: 50 },
  { name: 'Amber', value: 85 },
  { name: 'Green', value: 145 },
  { name: 'Teal', value: 180 },
  { name: 'Blue', value: 250 },
  { name: 'Purple', value: 290 },
  { name: 'Pink', value: 340 },
] as const;

export const CHROMA_PRESETS = [
  { name: 'Neutral', value: 0.02 },
  { name: 'Subtle', value: 0.08 },
  { name: 'Moderate', value: 0.14 },
  { name: 'Vibrant', value: 0.20 },
  { name: 'Bold', value: 0.25 },
] as const;
