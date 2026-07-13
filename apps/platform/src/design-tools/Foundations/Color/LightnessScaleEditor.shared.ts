/**
 * LightnessScaleEditor.shared.ts
 * Shared types and utilities for the lightness scale editor
 */

import type {
  LightnessScaleConfig,
  LightnessScaleMode,
  ColorScaleStep,
} from '@oneui/shared';

/**
 * Lightness values for all 25 steps
 */
export type LightnessValues = Record<ColorScaleStep, number>;

/**
 * Saved lightness scale preset
 */
export interface SavedLightnessScale {
  _id: string;
  name: string;
  description?: string;
  values: LightnessValues;
  createdAt: number;
  updatedAt: number;
}

/**
 * Lightness offsets for dark and light sides
 */
export interface LightnessOffsetsPreview {
  dark: number;  // -10 to +10, affects steps below the base
  light: number; // -10 to +10, affects steps above the base
}

export interface LightnessScaleEditorProps {
  /** Current lightness scale configuration */
  config: LightnessScaleConfig;
  /** Callback when configuration changes */
  onChange: (config: LightnessScaleConfig) => void;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** List of saved lightness scales for the "Saved" mode */
  savedScales?: SavedLightnessScale[];
  /** Callback to save current scale as preset */
  onSaveScale?: (name: string, description?: string) => Promise<void>;
  /** Callback to delete a saved scale */
  onDeleteSavedScale?: (id: string) => Promise<void>;
  /** Lightness offsets for real-time preview (dark and light sides) */
  lightnessOffsets?: LightnessOffsetsPreview;
}

export type { LightnessScaleConfig, LightnessScaleMode, ColorScaleStep };
